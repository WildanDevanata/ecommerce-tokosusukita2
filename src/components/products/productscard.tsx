'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';

export default function ProductCard({
  product,
}: {
  product: any;
}) {
  const { addToCart } = useApp();

  const [isWishlist, setIsWishlist] =
    useState(false);

  const [showNotif, setShowNotif] =
    useState(false);

  // ================= HANDLER =================

  const handleAddToCart = () => {
    addToCart(product);

    setShowNotif(true);

    setTimeout(() => {
      setShowNotif(false);
    }, 2500);
  };

  return (
    <div className="group relative bg-white rounded-2xl hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
      {/* NOTIFICATION */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showNotif
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <div className="backdrop-blur-md bg-emerald-500/95 text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />

          <p className="text-xs font-semibold whitespace-nowrap">
            Berhasil ditambahkan ke
            keranjang
          </p>
        </div>
      </div>

      {/* TOP */}
      <div
        className={`relative ${
          product.bgColor ||
          'bg-gray-50'
        } aspect-square flex items-center justify-center p-4`}
      >
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {product.emoji}
        </span>

        {/* Wishlist */}
        <button
          onClick={() =>
            setIsWishlist(
              !isWishlist
            )
          }
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={
              isWishlist
                ? 'currentColor'
                : 'none'
            }
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 mb-1">
          {product.category?.name ||
            'Produk'}
        </span>

        <Link
          href={`/products/${product.slug}`}
        >
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-3 mt-2">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />

          <span className="text-xs font-semibold text-gray-700">
            {product.rating || '4.8'}
          </span>
        </div>

        {/* BOTTOM */}
        <div className="mt-auto flex items-center justify-between">
          <p className="text-blue-600 font-bold">
            {new Intl.NumberFormat(
              'id-ID',
              {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }
            ).format(product.price)}
          </p>

          <button
            onClick={
              handleAddToCart
            }
            className="group/cart p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-blue-200 shadow-lg hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 group-hover/cart:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}