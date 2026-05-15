import React from 'react';
import Image from 'next/image';

interface ProductImageProps {
  imagePath: string;
  bgColor: string;
  price: number;
  originalPrice?: number;
}

export const ProductImage = ({
  imagePath,
  bgColor,
  price,
  originalPrice,
}: ProductImageProps) => {
  const discount = originalPrice
    ? Math.round(
        (1 - price / originalPrice) * 100
      )
    : 0;

  return (
    <div>
      {/* MAIN IMAGE */}
      <div
        className={`
          ${bgColor}
          rounded-3xl
          relative
          overflow-hidden
          shadow-sm
          aspect-square
          p-6
          flex
          items-center
          justify-center
        `}
      >
        {/* IMAGE */}
        <div className="relative w-full h-full">
          <Image
            src={imagePath}
            alt="Gambar Produk"
            fill
            className="
              object-cover
              rounded-2xl
            "
            priority
          />
        </div>

        {/* DISCOUNT BADGE */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
            -{discount}% DISKON
          </span>
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`
              relative
              w-20
              h-20
              rounded-2xl
              overflow-hidden
              border-2
              cursor-pointer
              ${i === 1
                ? 'border-blue-600'
                : 'border-gray-200 hover:border-blue-300'}
            `}
          >
            <Image
              src={imagePath}
              alt={`Thumbnail ${i}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};