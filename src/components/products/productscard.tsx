'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/store/appcontext'; // Pastikan casing path sesuai dengan nama file kamu (misal: AppContext)

export default function ProductCard({
  product,
}: {
  product: any;
}) {
  // 💡 Ambil wishlist global dan fungsi toggler-nya dari konteks
  const { addToCart, currentUser, wishlist, toggleWishlist } = useApp();

  const [showNotif, setShowNotif] = useState(false);

  // 🛡️ Validasi role: Hanya true jika role adalah 'CUSTOMER'
  const isCustomer = currentUser?.role === 'CUSTOMER';

  // 💝 Cek apakah ID produk ini ada di dalam array wishlist global
  const isWishlisted = wishlist.includes(product.id);

  // ================= HANDLERS =================

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah Link mengarahkan ke halaman detail

    // 🔒 Guard clause tambahan jika ada bypass manual
    if (!isCustomer) return;

    addToCart(product);
    setShowNotif(true);

    setTimeout(() => {
      setShowNotif(false);
    }, 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Mencegah Link mengarahkan ke halaman detail
    
    if (!isCustomer) return;
    
    // Panggil fungsi global untuk pasang/lepas status wishlist
    toggleWishlist(product.id);
  };

  // ================= DISCOUNT =================

  const discount =
    product.originalPrice &&
    product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[26px] border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* ================= NOTIF ================= */}

      <div
        className={`absolute top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
          showNotif
            ? 'translate-y-0 scale-100 opacity-100'
            : '-translate-y-3 scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-emerald-500/95 px-4 py-2 text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4" />
          <p className="whitespace-nowrap text-xs font-semibold">
            Ditambahkan ke keranjang
          </p>
        </div>
      </div>

      {/* ================= IMAGE ================= */}

      <div
        className={`relative aspect-square overflow-hidden ${
          product.bgColor || 'bg-blue-50'
        }`}
      >
        {/* BADGE LEFT */}
        {(product.isBestSeller || product.isNew) && (
          <div className="absolute left-3 top-3 z-20">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md ${
                product.isNew ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {product.isNew ? 'Baru' : '🔥'}
            </span>
          </div>
        )}

        {/* BADGE DISCOUNT */}
        {discount > 0 && (
          <div className="absolute right-3 top-3 z-20">
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              -{discount}%
            </span>
          </div>
        )}

        {/* IMAGE */}
        <div className="relative w-full h-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                {product.emoji || '🛍️'}
              </span>
            </div>
          )}
        </div>

        {/* WISHLIST (Hanya aktif/bisa diklik jika role customer) */}
        <button
          disabled={!isCustomer}
          onClick={handleWishlistToggle}
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all disabled:opacity-0 disabled:pointer-events-none ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* STOCK */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-medium text-white">
              Stok {product.stock}
            </span>
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}

      <div className="flex flex-1 flex-col p-4">
        {/* CATEGORY */}
        <span className="mb-2 inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
          {product.category?.name || 'Produk'}
        </span>

        {/* TITLE */}
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-snug text-gray-800 transition-colors group-hover:text-blue-600">
          {product.name}
        </h3>

        {/* RATING */}
        {product.rating > 0 && (
          <div className="mt-2 mb-3 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
            <span className="text-xs font-medium text-gray-700">{product.rating}</span>
            {product.reviewCount > 0 && (
              <span className="text-xs text-gray-400">
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* PRICE & CART */}
        <div className="flex items-end justify-between gap-2 pt-1 mt-auto">
          <div>
            <p className="text-[22px] font-bold leading-none text-blue-700">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>

            {product.originalPrice && (
              <p className="mt-1 text-xs text-gray-400 line-through">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  maximumFractionDigits: 0,
                }).format(product.originalPrice)}
              </p>
            )}
          </div>

          {/* CART BUTTON (DIPROTEKSI OLEH ROLE CUSTOMER) */}
          {isCustomer && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}