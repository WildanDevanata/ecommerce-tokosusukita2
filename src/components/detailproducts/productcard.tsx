import Link from 'next/link';
import Image from 'next/image';
import { formatRupiah } from '@/lib/utils'; // Pastikan utils ini ada

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number | null;
    image: string | null;  // 🌟 PERBAIKAN: Ubah menjadi string | null agar cocok dengan Prisma DB
    bgColor?: string | null; // 🌟 PERBAIKAN: Tambahkan | null jika kolom ini opsional di DB
  };
}

export function ProductCard({ product }: ProductCardProps) {
  // Menghitung persentase diskon dengan aman jika originalPrice tersedia
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  // 🌟 SOLUSI FALLBACK GAMBAR: Jika path image bernilai null, arahkan ke gambar placeholder lokal bawaan sistem
  const imageSrc = product.image || '/images/placeholder-milk.png'; 

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full"
    >
      {/* Area Gambar */}
      <div className={`relative ${product.bgColor || 'bg-gray-100'} aspect-square flex items-center justify-center overflow-hidden`}>
        
        {/* Container untuk Gambar */}
        <div className="relative w-full h-full p-6 transform group-hover:scale-105 transition-transform duration-300">
          <Image
            src={imageSrc} // 🌟 Menggunakan variabel fallback aman
            alt={product.name}
            fill // Memenuhi containernya
            className="object-contain" // Agar gambar tidak gepeng
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={false} // Atur true jika ini ditaruh di section LCP/paling atas halaman
          />
        </div>
        
        {/* Badge Diskon */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            -{discount}%
          </span>
        )}
      </div>

      {/* Konten teks deskripsi produk */}
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
          
          {/* Tombol Aksi Keranjang/Plus */}
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