'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, ExternalLink, Star, Package } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const itemsParam = searchParams.get('items');
  const projectParam = searchParams.get('project');
  const notesParam = searchParams.get('notes');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemsParam) {
      searchForProducts();
    }
  }, [itemsParam]);

  const searchForProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
      setItems(parsedItems);

      const response = await fetch('/api/search-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedItems,
          notes: notesParam ? decodeURIComponent(notesParam) : '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search products');
      }

      setSearchResults(data);
      setLoading(false);

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Best Deals
          </h1>
          <p className="text-lg text-gray-600">
            Real-time prices from major retailers
          </p>
        </div>

        {/* Bundle Options */}
        {bundles.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {bundles.map((bundle, index) => (
              <div
                key={bundle.retailer}
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  index === 0 ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {index === 0 && (
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                    BEST VALUE
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {bundle.retailer}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Complete bundle from one store
                </p>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  ${bundle.totalPrice.toFixed(2)}
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buy from {bundle.retailer}</span>
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {bundle.itemCount} items • One checkout
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Individual Items */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Individual Item Breakdown
          </h2>

          <div className="space-y-8">
            {searchResults.results.map((result, index) => {
              const products = result.allProducts || [];

              return (
                <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {result.itemName}
                      </h3>
                      {result.itemDetails?.notes && (
                        <p className="text-sm text-gray-600">{result.itemDetails.notes}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                      {products.length} found
                    </span>
                  </div>

                  {products.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-4">
                      {products.slice(0, 3).map((product, pIndex) => (
                        <div
                          key={pIndex}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                        >
                          {product.imageUrl && (
                            <img 
                              src={product.imageUrl} 
                              alt={product.title}
                              className="w-full h-40 object-contain mb-3 rounded"
                            />
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {product.source}
                            </span>
                            {pIndex === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                Lowest
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-sm text-gray-700 mb-2 line-clamp-2">
                            {product.title}
                          </h4>
                          
                          <div className="text-2xl font-bold text-blue-600 mb-2">
                            ${parseFloat(product.price).toFixed(2)}
                          </div>

                          {product.rating && (
                            <div className="flex items-center space-x-1 mb-3">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{product.rating}</span>
                              {product.ratingCount && (
                                <span className="text-xs text-gray-500">({product.ratingCount})</span>
                              )}
                            </div>
                          )}

                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2 text-sm"
                          >
                            <span>View Product</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No products found for this item. Try searching manually.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300 font-medium"
          >
            Start New Search
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Shopping List
          </button>
        </div>
      </main>

      {/* Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Live Product Search:</strong> Prices and availability updated in real-time from major retailers.
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
