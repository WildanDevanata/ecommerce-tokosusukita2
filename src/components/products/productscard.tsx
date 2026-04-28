'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useApp } from '@/store/appcontext';

export default function ProductCard({ product }: { product: any }) {
  const { addToCart } = useApp();
  const [isWishlist, setIsWishlist] = useState(false);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
      {/* Bagian Atas Card */}
      <div className={`relative ${product.bgColor || 'bg-gray-50'} aspect-square flex items-center justify-center p-4`}>
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {product.emoji}
        </span>
        
        {/* Wishlist Button */}
        <button 
          onClick={() => setIsWishlist(!isWishlist)}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${isWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
        >
          <Heart className="w-4 h-4" fill={isWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Konten Card */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-500 mb-1">
          {product.category?.name || 'Produk'}
        </span>
        <Link href={`/products/${product.slug}`}>
  <h3 className="hover:text-blue-600 cursor-pointer">{product.name}</h3>
</Link>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
          <span className="text-xs font-semibold">{product.rating || '4.8'}</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <p className="text-blue-600 font-bold">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
          </p>
          <button 
            onClick={() => addToCart(product)}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}