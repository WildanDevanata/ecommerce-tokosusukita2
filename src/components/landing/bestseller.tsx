'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from "@/components/landing/productcard";
import Link from 'next/link';

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

export default function Bestseller() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bestseller')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat produk terlaris:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50/50">
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

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🔥 Produk Terlaris
            </h2>
            <p className="text-gray-500 mt-2">Produk favorit para Bunda yang paling banyak dicari</p>
          </div>
          
          <Link 
            href="/products" 
            className="hidden md:block text-blue-600 font-semibold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {/* GRID DIBATASI HANYA 4 ITEM (SLICE 0, 4) AGAR 1 BARIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => {
            
            // Pemetaan data eksplisit agar cocok dengan interface Product global
            const cleanProductData = {
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: Number(product.price),
              originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
              categoryId: product.categoryId,
              image: product.image || "", 
              emoji: product.emoji || null,
              bgColor: product.bgColor || 'bg-blue-50',
              stock: Number(product.stock || 0),
              rating: Number(product.rating || 0),
              reviewCount: Number(product.reviewCount || 0),
              isNew: Boolean(product.isNew ?? false),
              isBestSeller: Boolean(product.isBestSeller ?? true), // Default true karena ini seksi bestseller
              categoryName: product.category?.name || 'Produk',
              soldCount: Number(product.reviewCount || 0), // Menyinkronkan teks terjual dari reviewCount
              category: product.category ? {
                id: product.category.id,
                name: product.category.name
              } : null
            };

            return (
              <ProductCard
                key={product.id}
                product={cleanProductData}
                showBestSeller={true}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}