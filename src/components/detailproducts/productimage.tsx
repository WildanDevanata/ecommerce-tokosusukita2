// src/components/products/product-image.tsx (atau path foldernya)
import React from 'react';
import Image from 'next/image'; // 1. WAJIB IMPORT INI

interface ProductImageProps {
  imagePath: string; // 2. Ganti nama prop dari 'emoji' ke 'imagePath'
  bgColor: string;
  price: number;
  originalPrice?: number;
}

export const ProductImage = ({ imagePath, bgColor, price, originalPrice }: ProductImageProps) => {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div>
      {/* 3. Container Utama untuk Gambar */}
      <div className={`${bgColor} rounded-3xl aspect-square flex items-center justify-center relative shadow-sm overflow-hidden`}>
        
        {/* 4. Ganti tag <span> raksasa dengan tag <Image> */}
        <div className="relative w-full h-full p-10"> {/* Beri padding agar gambar tidak mentok */}
          <Image
            src={imagePath} // Path dari DB: /images/fisher-price...jpg
            alt="Gambar Produk"
            fill // Agar gambar memenuhi containernya
            className="object-contain" // Agar gambar tidak distorsi (gepeng)
            priority={true} // Prioritas load karena ini gambar utama (LCP)
          />
        </div>

        {/* Badge Diskon (Tetap sama) */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
            -{discount}% DISKON
          </span>
        )}
      </div>

      {/* 5. Bagian Thumbnail di Bawah (PENTING juga) */}
      <div className="flex gap-2 mt-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`${bgColor} rounded-xl w-16 h-16 flex items-center justify-center cursor-pointer border-2 relative overflow-hidden ${i === 1 ? 'border-blue-600' : 'border-transparent hover:border-blue-300'}`}>
            
            {/* Pakai <Image> juga untuk thumbnail */}
            <div className="relative w-full h-full p-2">
              <Image
                src={imagePath}
                alt={`Thumbnail ${i}`}
                fill
                className="object-contain"
                sizes="64px" // Tentukan ukuran thumbnail
              />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};