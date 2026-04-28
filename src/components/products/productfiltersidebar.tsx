'use client';

import { Star, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  categories: any[];
  selectedCategories: string[];
  setSelectedCategories: (ids: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
}

export default function ProductFilterSidebar({
  // BERIKAN DEFAULT VALUE [] UNTUK SEMUA ARRAY AGAR TIDAK ERROR
  categories = [], 
  selectedCategories = [],
  setSelectedCategories,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating
}: SidebarProps) {

  const toggleCategory = (id: string) => {
    if (id === 'all') {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories(
      selectedCategories.includes(id) 
        ? selectedCategories.filter(c => c !== id) 
        : [...selectedCategories, id]
    );
  };

  // Hitung total produk dengan aman
  const totalProducts = Array.isArray(categories) 
    ? categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0) 
    : 0;

  return (
    <aside className="w-72 hidden lg:block space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-4 flex items-center gap-3 text-white shadow-md">
        <div className="bg-white/20 p-2 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <h2 className="font-bold text-lg">Filter Produk</h2>
      </div>

      <div className="bg-white rounded-b-2xl border-x border-b border-gray-100 p-5 shadow-sm space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <h3>Kategori Produk</h3>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => toggleCategory('all')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                selectedCategories.length === 0 
                ? 'bg-indigo-500 text-white shadow-indigo-100 shadow-lg' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm font-medium">Semua Produk</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategories.length === 0 ? 'bg-white text-indigo-600' : 'bg-blue-500 text-white'}`}>
                {totalProducts}
              </span>
            </button>

            {/* List Kategori dengan pengaman Array.isArray */}
            {Array.isArray(categories) && categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  selectedCategories.includes(cat.id)
                  ? 'bg-indigo-500 text-white shadow-indigo-100 shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                {(cat.productCount || 0) > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCategories.includes(cat.id) ? 'bg-white text-indigo-600' : 'bg-blue-500 text-white'}`}>
                    {cat.productCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ... bagian harga dan rating tetap sama ... */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-4">Rentang Harga</h4>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0] || ''}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1] || ''}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-4">Rating Minimum</h4>
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                  minRating === rating ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">& ke atas</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}