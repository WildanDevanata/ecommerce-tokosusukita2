'use client';

import { useEffect, useState } from 'react';
import { useApp } from "@/store/appcontext";
import { useRouter } from 'next/navigation';
import ProductCard from "@/components/landing/productcard";
import Link from 'next/link'; // Import Link agar navigasi bekerja

export default function NewProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const { addToCart, isLoggedIn } = useApp();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/newproducts')
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
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center md:text-left">Produk Terbaru</h2>
            <p className="text-gray-500 mt-2 text-center md:text-left">Nutrisi terbaik yang baru saja tiba untuk si kecil</p>
          </div>
          
          {/* TOMBOL LIHAT SEMUA AKTIF */}
          <Link 
            href="/products" 
            className="hidden md:block text-blue-600 font-semibold hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        {/* GRID DIBATASI 4 ITEM (1 BARIS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={toggleWishlist}
              inWishlist={wishlist.includes(product.id)}
            />
          ))}
        </div>

        {/* Tombol Lihat Semua versi Mobile (Muncul di bawah grid jika layar kecil) */}
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