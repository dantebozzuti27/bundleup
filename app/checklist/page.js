'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Check, Plus, Loader2, ArrowRight } from 'lucide-react';

function ChecklistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectQuery = searchParams.get('q');

  const [checklist, setChecklist] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [customItem, setCustomItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (projectQuery) {
      generateChecklist();
    }
  }, [projectQuery]);

  const generateChecklist = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate checklist');
      }

      setChecklist(data.checklist);
      
      // Auto-select essential items
      const essentialIds = data.checklist
        .filter(item => item.priority === 'essential')
        .map((_, index) => index);
      setSelectedItems(new Set(essentialIds));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const addCustomItem = () => {
    if (!customItem.trim()) return;

    const newItem = {
      name: customItem,
      category: 'custom',
      priority: 'optional',
      quantity: '1',
      notes: 'User-added item',
    };

    const newChecklist = [...checklist, newItem];
    setChecklist(newChecklist);
    setSelectedItems(new Set([...selectedItems, newChecklist.length - 1]));
    setCustomItem('');
  };

  const handleFindProducts = () => {
    const selected = checklist.filter((_, index) => selectedItems.has(index));
    const itemsParam = encodeURIComponent(JSON.stringify(selected));
    const notesParam = encodeURIComponent(additionalNotes);
    
    router.push(`/results?items=${itemsParam}&notes=${notesParam}&project=${encodeURIComponent(projectQuery)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-700">Analyzing your project...</p>
          <p className="text-sm text-gray-500 mt-2">Our AI is generating a smart checklist</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BundleUp</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your {projectQuery} Checklist
          </h1>
          <p className="text-lg text-gray-600">
            Select the items you need. We've pre-selected the essentials for you.
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="space-y-4">
            {checklist.map((item, index) => (
              <div
                key={index}
                onClick={() => toggleItem(index)}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedItems.has(index)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedItems.has(index)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedItems.has(index) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'essential'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Custom Item */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Need something else? Add a custom item:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                placeholder="e.g., LED strip lights"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addCustomItem}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Additional Requirements */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any specific requirements? (optional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g., Budget under $1000, weatherproof, modern style"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Summary & Action */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {selectedItems.size} items selected
              </p>
              <p className="text-sm text-gray-600">
                Ready to find the best deals?
              </p>
            </div>
            <button
              onClick={handleFindProducts}
              disabled={selectedItems.size === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Find Products</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
    }>
      <ChecklistContent />
    </Suspense>
  );
}
