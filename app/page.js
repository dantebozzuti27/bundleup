'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hammer, Search, ShoppingCart, Sparkles } from 'lucide-react';

export default function Home() {
  const [projectInput, setProjectInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!projectInput.trim()) return;

    setLoading(true);
    
    // Navigate to results page with the search query
    router.push(`/checklist?q=${encodeURIComponent(projectInput)}`);
  };

  const exampleProjects = [
    'backyard bar',
    'home office setup',
    'raised garden bed',
    'closet organization',
    'outdoor fire pit',
    'floating shelves'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BundleUp</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#examples" className="text-gray-600 hover:text-gray-900">Examples</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bundle Your DIY Dreams
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find everything you need for your project in one place. AI-powered shopping made simple.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                placeholder="What are you building today? (e.g., backyard bar)"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !projectInput.trim()}
                className="absolute right-2 top-2 bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Find Materials</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Example Projects */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-3">Try these popular projects:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleProjects.map((project) => (
                <button
                  key={project}
                  onClick={() => setProjectInput(project)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {project}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20" id="how-it-works">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
            <p className="text-gray-600">
              Our AI analyzes your project and suggests everything you'll need, so you don't miss a thing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Prices, Fast</h3>
            <p className="text-gray-600">
              We search across major retailers simultaneously to find you the best deals on every item.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">One-Click Checkout</h3>
            <p className="text-gray-600">
              Buy everything from one store with a single checkout, or mix and match for maximum savings.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-center mb-12">How BundleUp Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-semibold mb-2">Enter Your Project</h4>
              <p className="text-sm text-gray-600">Tell us what you're building</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-semibold mb-2">Review AI Checklist</h4>
              <p className="text-sm text-gray-600">Select items you need</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-semibold mb-2">Compare Deals</h4>
              <p className="text-sm text-gray-600">See bundled prices from top retailers</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-semibold mb-2">Checkout</h4>
              <p className="text-sm text-gray-600">Buy everything with one click</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xl font-bold">BundleUp</span>
              </div>
              <p className="text-gray-400">
                Your AI-powered DIY shopping companion
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Examples</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Affiliate Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 BundleUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
