'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductFilterSidebar from '@/components/products/productfiltersidebar';
import ProductCard from '@/components/products/productscard';

const ITEMS_PER_PAGE = 12;

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);

  // Handle URL Param
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  // Load Data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        setProducts(await resProd.json());
        setCategories(await resCat.json());
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategories.length > 0) result = result.filter(p => selectedCategories.includes(p.categoryId));
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);

    // Sorting Logic
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, search, selectedCategories, priceRange, sortBy, minRating]);

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const hasFilters = search || selectedCategories.length > 0 || minRating > 0;

  return (
    <>
      {/* Search Bar & Sort */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" suppressHydrationWarning />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari kebutuhan si kecil..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="price-asc">Harga: Termurah</option>
          <option value="price-desc">Harga: Termahal</option>
        </select>
      </div>

      {/* Filter Pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedCategories.map(catId => (
            <span key={catId} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2">
              {categories.find(c => c.id === catId)?.name || catId}
              <X 
                className="w-3 h-3 cursor-pointer" 
                suppressHydrationWarning 
                onClick={() => setSelectedCategories(prev => prev.filter(c => c !== catId))} 
              />
            </span>
          ))}
          <button 
            onClick={() => {setSearch(''); setSelectedCategories([]); setMinRating(0);}} 
            className="text-xs text-gray-500 underline"
          >
            Hapus Filter
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <ProductFilterSidebar 
          categories={categories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
        />

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20">Memuat produk...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              
              {/* Pagination Controls */}
              <div className="mt-8 flex justify-center items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p-1))} 
                  className="p-2 border rounded-lg hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" suppressHydrationWarning />
                </button>
                <span className="text-sm px-4">Halaman {page} dari {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p+1))} 
                  className="p-2 border rounded-lg hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" suppressHydrationWarning />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}