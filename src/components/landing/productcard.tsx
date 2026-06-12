'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import { Heart, ShoppingCart, Star, CheckCircle2 } from 'lucide-react';
import { useApp, Product } from '@/store/appcontext';
import { formatRupiah } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  showBestSeller?: boolean;
}

export default function ProductCard({ product, showBestSeller }: ProductCardProps) {
  const { addToCart, currentUser, wishlist, toggleWishlist } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); 

  const isCustomer = currentUser?.role === 'CUSTOMER';
  const isWishlisted = wishlist?.includes(product.id) || false;

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isCustomer || !currentUser?.id) {
      router.push('/login');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (addToCart) {
        await addToCart(product);
      }

      setShowNotif(true);
      setTimeout(() => {
        setShowNotif(false);
      }, 2000);

    } catch (error) {
      console.error('Error handleAddToCart:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isCustomer) {
      router.push('/login');
      return;
    }

    try {
      if (toggleWishlist) {
        await toggleWishlist(product.id);
      }
    } catch (error) {
      console.error('Gagal memperbarui wishlist:', error);
    }
  };

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[26px] border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full"
    >
      {/* NOTIF BALON */}
      <div
        className={`absolute top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${
          showNotif ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3 scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-emerald-500/95 px-4 py-2 text-white shadow-2xl backdrop-blur-md">
          <CheckCircle2 className="h-4 w-4" />
          <p className="whitespace-nowrap text-xs font-semibold">Ditambahkan ke keranjang</p>
        </div>
      </div>

      {/* IMAGE AREA */}
      <div className={`relative aspect-square overflow-hidden ${product.bgColor || 'bg-blue-50'}`}>
        {(product.isBestSeller || product.isNew) && (
          <div className="absolute left-3 top-3 z-20">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md ${product.isNew ? 'bg-green-500' : 'bg-red-500'}`}>
              {product.isNew ? 'Baru' : '🔥 TERLARIS'}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute right-3 top-3 z-20">
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">-{discount}%</span>
          </div>
        )}

        <div className="relative w-full h-full">
          <Image
            src={product.image || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 z-30 ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
          {product.categoryName || product.category?.name || 'Produk'}
        </span>

        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-snug text-gray-800 transition-colors group-hover:text-blue-600">
          {product.name}
        </h3>

        {/* Rating & Sold Info berdasarkan Review */}
        <div className="mt-2 mb-3 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 text-yellow-400" fill="currentColor" />
            <span className="text-xs font-semibold text-gray-700">{product.rating || 0}</span>
          </div>
          
          {product.reviewCount > 0 && (
            <>
              <span className="text-gray-300 text-xs mx-0.5">|</span>
              <span className="text-xs text-gray-500">
                {product.reviewCount >= 1000 
                  ? `${(product.reviewCount / 1000).toFixed(1)}rb` 
                  : product.reviewCount}{' '}
                terjual
              </span>
            </>
          )}
        </div>

        {/* Price & Cart Button */}
        <div className="flex items-end justify-between gap-2 pt-1 mt-auto">
          <div>
            <p className="text-[20px] font-bold leading-none text-blue-700">
              {formatRupiah(product.price)}
            </p>
            {product.originalPrice && (
              <p className="mt-1 text-xs text-gray-400 line-through">
                {formatRupiah(product.originalPrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAddToCart}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all active:scale-95 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:bg-blue-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}