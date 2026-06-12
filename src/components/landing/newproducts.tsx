'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from "@/components/landing/productcard";
import Link from 'next/link';

// Definisikan interface lokal yang sesuai dengan struktur data dari API / prisma
interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  emoji?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;
  rating: number;
  reviewCount: number;
  slug: string;
  stock: number;
  bgColor?: string | null;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export default function NewProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Memanggil API products global dengan filter khusus produk terbaru
    fetch('/api/products?newArrival=true')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat produk terbaru:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md mb-10"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full bg-gray-100 animate-pulse rounded-[26px]"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Jika tidak ada produk baru yang aktif, sembunyikan section
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center md:text-left">Produk Terbaru</h2>
            <p className="text-gray-500 mt-2 text-center md:text-left">Nutrisi terbaik yang baru saja tiba untuk si kecil</p>
          </div>
          
          <Link 
            href="/products" 
            className="hidden md:block text-blue-600 font-semibold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

       {/* GRID UTAMA */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  {products.slice(0, 4).map((product) => {
    
    // Pemetaan eksplisit total dengan menyertakan fallback categoryName dan soldCount
    const cleanProductData = {
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: Number(product.price),
  originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
  categoryId: product.categoryId,
  
  // 🚀 PERBAIKAN: Ubah null menjadi string kosong "" atau path placeholder gambar
  image: product.image || "", 
  
  emoji: product.emoji || null,
  bgColor: product.bgColor || 'bg-blue-50',
  stock: Number(product.stock || 0),
  rating: Number(product.rating || 0),
  reviewCount: Number(product.reviewCount || 0),
  isNew: Boolean(product.isNew ?? true),
  isBestSeller: Boolean(product.isBestSeller ?? false),
  categoryName: product.category?.name || 'Produk',
  soldCount: Number(product.reviewCount || 0),
  category: product.category ? {
    id: product.category.id,
    name: product.category.name
  } : null
};

    return (
      <ProductCard
        key={product.id}
        product={cleanProductData} 
      />
    );
  })}
</div>

        {/* TOMBOL MOBILE */}
        <div className="mt-8 md:hidden flex justify-center">
          <Link 
            href="/products" 
            className="text-blue-600 font-semibold hover:underline"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    </section>
  );
}