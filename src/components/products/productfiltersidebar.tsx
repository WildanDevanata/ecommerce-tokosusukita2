'use client';

import { Star, LayoutGrid, X } from 'lucide-react';

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

  // Handler Harga Min: Jika input kosong, set default ke 0
  const handleMinPriceChange = (val: string) => {
    const num = val === '' ? 0 : Number(val);
    setPriceRange([num, priceRange[1]]);
  };

  // Handler Harga Max: Jika input kosong, set default ke Infinity (menampilkan semua harga)
  const handleMaxPriceChange = (val: string) => {
    const num = val === '' ? Infinity : Number(val);
    setPriceRange([priceRange[0], num]);
  };

  // Fungsi Reset Filter untuk membersihkan pencarian
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, Infinity]);
    setMinRating(0); // 0 berarti menampilkan semua rating tanpa batas minimal
  };

  const totalProducts = Array.isArray(categories) 
    ? categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0) 
    : 0;

  return (
    <aside className="w-72 hidden lg:block space-y-6">
      {/* Header Sidebar */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h2 className="font-bold text-lg">Filter Produk</h2>
        </div>
        
        {/* Tombol Reset */}
        {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] !== Infinity || minRating > 0) && (
          <button 
            onClick={handleResetFilters}
            className="text-xs bg-white/20 hover:bg-white/30 transition-all px-2 py-1 rounded-md flex items-center gap-1 font-medium"
          >
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <div className="bg-white rounded-b-2xl border-x border-b border-gray-100 p-5 shadow-sm space-y-8">
        {/* KATEGORI */}
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

        {/* RENTANG HARGA */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-4">Rentang Harga</h4>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-medium">Rp</span>
              <input
                type="number"
                placeholder="Harga Minimum"
                value={priceRange[0] === 0 ? '' : priceRange[0]}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-medium">Rp</span>
              <input
                type="number"
                placeholder="Harga Maksimum"
                value={priceRange[1] === Infinity ? '' : priceRange[1]}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* RATING MINIMUM (1 - 5 BINTANG LENGKAP) */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-4">Rating Produk</h4>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setMinRating(minRating === rating ? 0 : rating)} // Jika diklik lagi, filter rating akan mati (0)
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
                  minRating === rating 
                    ? 'bg-blue-50/80 border-blue-200 text-blue-700 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-500'
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
                <span className="text-xs font-semibold">
                  {rating === 5 ? '5 Bintang' : '& ke atas'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}