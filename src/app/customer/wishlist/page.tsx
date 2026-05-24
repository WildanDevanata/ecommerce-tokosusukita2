"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Search, X, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';
import { useApp, Product } from '@/store/appcontext'; 

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, products, isLoggedIn } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // ➕ State untuk toast pop-up pesan sukses
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter produk global yang ID-nya ada di dalam daftar array wishlist
  const wishlisted = products.filter(p => wishlist.includes(p.id));

  const filtered = wishlisted.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(search.toLowerCase()))
  );

  // ➕ Fungsi helper untuk menampilkan pop-up pesan
  const showPopupMessage = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) { 
      router.push('/login'); 
      return; 
    }
    
    addToCart(product);

    // Tampilkan pop-up pesan untuk satu produk
    showPopupMessage(`${product.name} berhasil masuk keranjang!`);

    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds(prev => { 
      const s = new Set(prev); 
      s.delete(product.id); 
      return s; 
    }), 2000);
  };

  const handleRemove = (productId: string) => {
    setRemovingIds(prev => new Set(prev).add(productId));
    setTimeout(() => {
      toggleWishlist(productId);
      setRemovingIds(prev => { 
        const s = new Set(prev); 
        s.delete(productId); 
        return s; 
      });
    }, 300);
  };

  const handleMoveAllToCart = () => {
    if (!isLoggedIn) { 
      router.push('/login'); 
      return; 
    }
    
    const availableProducts = filtered.filter(p => p.stock > 0);

    if (availableProducts.length === 0) return;

    availableProducts.forEach(p => {
      addToCart(p);
    });

    // Tampilkan pop-up pesan untuk semua produk yang berhasil dimasukkan
    showPopupMessage(`Semua produk tersedia (${availableProducts.length} item) berhasil masuk keranjang!`);
  };

  return (
    <>
      <Navbar />
      
      {/* ➕ FLOAT TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-green-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm font-semibold">
            {toastMessage}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                <h1 className="text-gray-800 text-xl font-bold">Wishlist Saya</h1>
                {wishlisted.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {wishlisted.length} produk
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">Produk yang Anda simpan untuk dibeli nanti</p>
            </div>
          </div>

          {wishlisted.length === 0 ? (
            /* ── Empty State ── */
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-7xl mb-4">💝</div>
              <h2 className="text-gray-700 font-semibold mb-2">Wishlist Masih Kosong</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                Simpan produk favorit Anda di sini agar mudah ditemukan dan dibeli nanti.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Mulai Belanja
              </Link>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari produk di wishlist..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleMoveAllToCart}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tambah Semua ke Keranjang
                </button>
              </div>

              {/* Search result count */}
              {search && (
                <p className="text-sm text-gray-500 mb-4">
                  {filtered.length} produk ditemukan untuk "{search}"
                </p>
              )}

              {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-gray-600">Tidak ada produk yang cocok</p>
                  <button onClick={() => setSearch('')} className="mt-3 text-blue-600 text-sm hover:underline">
                    Hapus pencarian
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(product => {
                    const isAdded = addedIds.has(product.id);
                    const isRemoving = removingIds.has(product.id);
                    const outOfStock = product.stock === 0;

                    return (
                      <div
                        key={product.id}
                        className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                      >
                        {/* Product image area */}
                        <Link href={`/products/${product.slug}`} className="block relative">
                          <div className={`relative aspect-[4/3] w-full overflow-hidden ${product.bgColor || 'bg-stone-100'}`}>
                            <Image
                              src={product.image || '/images/placeholder-product.png'}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>

                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Baru</span>
                            )}
                            {product.isBestSeller && (
                              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Terlaris</span>
                            )}
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                              </span>
                            )}
                            {outOfStock && (
                              <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Habis</span>
                            )}
                          </div>

                          {/* Remove heart */}
                          <button
                            onClick={e => { e.preventDefault(); handleRemove(product.id); }}
                            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors group"
                            title="Hapus dari Wishlist"
                          >
                            <Heart className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="currentColor" />
                          </button>
                        </Link>

                        {/* Info */}
                        <div className="p-4">
                          <Link href={`/products/${product.slug}`}>
                            <p className="text-xs text-gray-400 mb-1">{product.categoryName || 'Susu'}</p>
                            <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 hover:text-blue-600 transition-colors leading-snug">
                              {product.name}
                            </p>
                          </Link>

                          {/* Price */}
                          <div className="mb-3">
                            <span className="text-blue-700 font-bold">{formatRupiah(product.price)}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through ml-2">{formatRupiah(product.originalPrice)}</span>
                            )}
                          </div>

                          {/* Stock indicator */}
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${outOfStock ? 'bg-red-400' : product.stock <= 5 ? 'bg-yellow-400' : 'bg-green-400'}`} />
                            <span className="text-xs text-gray-500">
                              {outOfStock ? 'Stok habis' : product.stock <= 5 ? `Sisa ${product.stock}` : 'Stok tersedia'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={outOfStock}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                isAdded
                                  ? 'bg-green-50 border border-green-300 text-green-600'
                                  : outOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAdded ? (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Ditambahkan!</>
                              ) : (
                                <><ShoppingCart className="w-3.5 h-3.5" /> {outOfStock ? 'Habis' : 'Tambah Ke Keranjang'}</>
                              )}
                            </button>
                            <button
                              onClick={() => handleRemove(product.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus dari wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer summary */}
              {filtered.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">{filtered.filter(p => p.stock > 0).length}</span> produk tersedia ·{' '}
                    <span className="text-gray-400">{filtered.filter(p => p.stock === 0).length} habis stok</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/products"
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                      Lanjut Belanja
                    </Link>
                    <Link
                      href="/customer/cart"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Lihat Keranjang
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}