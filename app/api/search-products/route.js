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

    // Calculate bundle totals by retailer
    const retailerBundles = calculateRetailerBundles(results);

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
  const retailerMap = new Map();

  // Aggregate products by retailer
  results.forEach(result => {
    if (result.allProducts && result.allProducts.length > 0) {
      result.allProducts.forEach(product => {
        const source = product.source || 'Unknown';
        
        if (!retailerMap.has(source)) {
          retailerMap.set(source, {
            retailer: source,
            items: [],
            totalPrice: 0,
            itemCount: 0,
          });
        }

        const bundle = retailerMap.get(source);
        bundle.items.push({
          itemName: result.itemName,
          product: product,
        });
        bundle.totalPrice += parseFloat(product.price) || 0;
        bundle.itemCount += 1;
      });
    }
  });

  // Convert to array and sort by completeness and price
  const bundles = Array.from(retailerMap.values())
    .filter(b => b.itemCount >= results.length * 0.5) // At least 50% of items
    .sort((a, b) => {
      // Prioritize bundles with more items
      if (b.itemCount !== a.itemCount) {
        return b.itemCount - a.itemCount;
      }
      // Then sort by price
      return a.totalPrice - b.totalPrice;
    })
    .slice(0, 3); // Top 3 bundles

  return bundles;
}
