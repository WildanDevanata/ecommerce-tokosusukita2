import Link from 'next/link';
import Image from 'next/image'; // JANGAN LUPA IMPORT INI
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string; // URL gambar dari database atau folder public
  bgColor: string;
  categoryName: string;
  rating: number;
  soldCount: number;
  isBestSeller: boolean;
  isNew: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  inWishlist: boolean;
  showBestSeller?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  inWishlist,
  showBestSeller,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Area Gambar */}
      <div className={`relative ${product.bgColor || 'bg-gray-100'} aspect-square overflow-hidden p-4`}>
        <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain" 
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={false} // Gunakan true jika ini produk yang muncul di paling atas (LCP)
          />
        </div>

        {/* Badge: Baru atau Terlaris */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {(product.isNew || (showBestSeller && product.isBestSeller)) && (
            <span
              className={`text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                product.isNew ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              {product.isNew ? 'BARU' : '🔥 TERLARIS'}
            </span>
          )}
        </div>

        {/* Badge: Diskon */}
        {product.originalPrice && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10 shadow-sm">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product.id, e);
          }}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[9px] uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full self-start mb-1 font-bold">
          {product.categoryName}
        </span>
        
        <p className="text-sm text-gray-800 font-semibold line-clamp-2 flex-1 mb-2">
          {product.name}
        </p>

        {/* Rating & Sold Info */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            <span className="text-xs text-gray-700 font-medium">{product.rating}</span>
          </div>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-[11px] text-gray-500">
            {product.soldCount >= 1000 
              ? `${(product.soldCount / 1000).toFixed(1)}rb` 
              : product.soldCount}{' '}
            terjual
          </span>
        </div>

        {/* Price & Cart Button */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through decoration-red-400/50">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
            <span className="text-blue-700 font-bold text-sm">
              {formatRupiah(product.price)}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product, e);
            }}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-90"
            title="Tambah ke keranjang"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}