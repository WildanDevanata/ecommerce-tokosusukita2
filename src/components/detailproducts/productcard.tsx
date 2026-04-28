// src/components/detailprodutcs/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image'; // 1. WAJIB IMPORT INI
import { formatRupiah } from '@/lib/utils'; // Pastikan utils ini ada

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    image: string; // Ini akan berisi path seperti '/images/enfagrow.jpg'
    bgColor: string; // Ini akan berisi class seperti 'bg-blue-50'
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full"
    >
      {/* Area Gambar (SEBELUMNYA pakai <span>, SEKARANG pakai <Image>) */}
      <div className={`relative ${product.bgColor || 'bg-gray-100'} aspect-square flex items-center justify-center overflow-hidden`}>
        
        {/* 2. Container untuk Gambar Asli */}
        <div className="relative w-full h-full p-6 transform group-hover:scale-105 transition-transform duration-300">
          <Image
            src={product.image} // Path dari database
            alt={product.name}
            fill // Memenuhi containernya
            className="object-contain" // Agar gambar tidak gepeng
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        
        {/* Badge Diskon (Tetap sama) */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            -{discount}%
          </span>
        )}
      </div>

      {/* Konten (Tetap sama, sesuaikan styling jika perlu) */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-2 flex-1 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {formatRupiah(product.originalPrice)}
              </span>
            )}
            <span className="text-blue-700 font-bold text-sm">
              {formatRupiah(product.price)}
            </span>
          </div>
          
          {/* Tombol keranjang kecil (UI tambahan agar lebih lengkap) */}
          <div className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
             </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}