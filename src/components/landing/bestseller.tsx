'use client';

import { useEffect, useState } from 'react';
import { useApp } from "@/store/appcontext";
import { useRouter } from 'next/navigation';
import ProductCard from "@/components/landing/productcard";
import Link from 'next/link'; // Import Link

export default function Bestseller() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const { addToCart, isLoggedIn } = useApp();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/bestseller')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      bgColor: product.bgColor,
      quantity: 1,
      stock: product.stock,
      weight: product.weight,
    });
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) return null;

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
          
          {/* TOMBOL LIHAT SEMUA SEKARANG BEKERJA */}
          {/* TOMBOL LIHAT SEMUA AKTIF */}
          <Link 
            href="/products" 
            className="hidden md:block text-blue-600 font-semibold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {/* GRID DIBATASI HANYA 4 ITEM (SLICE 0, 4) AGAR 1 BARIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={toggleWishlist}
              inWishlist={wishlist.includes(product.id)}
              showBestSeller={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}