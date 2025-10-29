import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { items, notes } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    const SERPER_API_KEY = process.env.SERPER_API_KEY;

    if (!SERPER_API_KEY) {
      return NextResponse.json(
        { error: 'Serper API key not configured' },
        { status: 500 }
      );
    }

    // Search for each item in parallel
    const searchPromises = items.map(async (item) => {
      const searchQuery = `${item.name} ${notes || ''} buy online`.trim();

      try {
        const response = await fetch('https://google.serper.dev/shopping', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: searchQuery,
            num: 9, // Get 9 results (3 per tier)
            gl: 'us', // United States
          }),
        });

        if (!response.ok) {
          throw new Error(`Serper API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Process and categorize results into tiers
        const products = data.shopping || [];
        
        // Sort by price
        const sortedProducts = products
          .filter(p => p.price && p.title)
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        // Divide into 3 tiers
        const tierSize = Math.ceil(sortedProducts.length / 3);
        
        return {
          itemName: item.name,
          itemDetails: item,
          tiers: {
            low: sortedProducts.slice(0, tierSize).slice(0, 3),
            mid: sortedProducts.slice(tierSize, tierSize * 2).slice(0, 3),
            high: sortedProducts.slice(tierSize * 2).slice(0, 3),
          },
          allProducts: sortedProducts.slice(0, 9),
        };

      } catch (error) {
        console.error(`Search error for ${item.name}:`, error);
        return {
          itemName: item.name,
          itemDetails: item,
          error: error.message,
          tiers: { low: [], mid: [], high: [] },
          allProducts: [],
        };
      }
    });

    const results = await Promise.all(searchPromises);

    console.log('\n📦 Starting bundle calculation...');
    // Calculate bundle totals by retailer
    const retailerBundles = calculateRetailerBundles(results);
    console.log('📦 Bundle calculation complete. Returning', retailerBundles.length, 'bundles\n');

    return NextResponse.json({
      success: true,
      results,
      bundles: retailerBundles,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for products', details: error.message },
      { status: 500 }
    );
  }
}

function calculateRetailerBundles(results) {
  console.log('\n=== BUNDLE CALCULATION START ===');
  console.log('Total results to process:', results.length);
  
  const retailerMap = new Map();

  // For each item in the checklist
  results.forEach((result, resultIndex) => {
    console.log(`\nProcessing result ${resultIndex + 1}: "${result.itemName}"`);
    console.log('  All products count:', result.allProducts?.length || 0);
    
    if (!result.allProducts || result.allProducts.length === 0) {
      console.log('  ⚠️  Skipping - no products found');
      return;
    }

    // Find the cheapest product from each retailer for this item
    const retailerBestPrices = new Map();
    
    result.allProducts.forEach((product, prodIndex) => {
      console.log(`    Product ${prodIndex + 1}:`, {
        source: product.source,
        price: product.price,
        title: product.title?.substring(0, 30)
      });
      
      if (!product.price || !product.source) {
        console.log('      ⚠️  Skipping - missing price or source');
        return;
      }
      
      const source = product.source;
      const price = parseFloat(product.price);
      
      // Skip invalid prices
      if (isNaN(price) || price <= 0) {
        console.log('      ⚠️  Skipping - invalid price:', price);
        return;
      }
      
      // Keep the cheapest product from each retailer for this item
      if (!retailerBestPrices.has(source)) {
        retailerBestPrices.set(source, {
          product: product,
          price: price,
          itemName: result.itemName
        });
        console.log(`      ✓ Set as best price for ${source}: $${price}`);
      } else {
        const current = retailerBestPrices.get(source);
        if (price < current.price) {
          retailerBestPrices.set(source, {
            product: product,
            price: price,
            itemName: result.itemName
          });
          console.log(`      ✓ Updated best price for ${source}: $${price} (was $${current.price})`);
        }
      }
    });

    console.log(`  Found best prices from ${retailerBestPrices.size} retailers`);

    // Add best price from each retailer to the bundle
    retailerBestPrices.forEach((best, source) => {
      if (!retailerMap.has(source)) {
        retailerMap.set(source, {
          retailer: source,
          items: [],
          totalPrice: 0,
          itemCount: 0,
        });
        console.log(`  Created new bundle for: ${source}`);
      }

      const bundle = retailerMap.get(source);
      bundle.items.push(best);
      bundle.totalPrice += best.price;
      bundle.itemCount += 1;
      console.log(`  Added to ${source} bundle: $${best.price} (total now: $${bundle.totalPrice})`);
    });
  });

  console.log('\n=== BUNDLE AGGREGATION ===');
  console.log('Total retailers found:', retailerMap.size);
  retailerMap.forEach((bundle, retailer) => {
    console.log(`${retailer}: ${bundle.itemCount} items, $${bundle.totalPrice.toFixed(2)}`);
  });

  // Convert to array and sort
  const totalItems = results.filter(r => r.allProducts && r.allProducts.length > 0).length;
  console.log('\nTotal items to match:', totalItems);
  
  const bundles = Array.from(retailerMap.values())
    .filter(b => {
      const valid = b.itemCount > 0 && b.totalPrice > 0;
      if (!valid) {
        console.log(`  ⚠️  Filtering out ${b.retailer}: items=${b.itemCount}, price=${b.totalPrice}`);
      }
      return valid;
    })
    .map(bundle => ({
      ...bundle,
      totalPrice: Math.round(bundle.totalPrice * 100) / 100,
      completeness: Math.round((bundle.itemCount / totalItems) * 100),
      missingItems: totalItems - bundle.itemCount,
    }))
    .sort((a, b) => {
      // Sort by completeness first (more items = better)
      if (b.itemCount !== a.itemCount) {
        return b.itemCount - a.itemCount;
      }
      // Then by price (cheaper = better)
      return a.totalPrice - b.totalPrice;
    })
    .slice(0, 5);

  console.log('\n=== FINAL BUNDLES ===');
  console.log('Bundles to return:', bundles.length);
  bundles.forEach((bundle, index) => {
    console.log(`${index + 1}. ${bundle.retailer}: ${bundle.itemCount}/${totalItems} items ($${bundle.totalPrice}) - ${bundle.completeness}% complete`);
  });
  console.log('=== BUNDLE CALCULATION END ===\n');

  return bundles;
}
