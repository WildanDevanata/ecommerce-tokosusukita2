// src/app/products/[slug]/product-details-container.tsx
'use client';

import { useState } from 'react';
import { ProductDetails } from '@/components/detailproducts/productdetail';
import { formatRupiah } from '@/lib/utils';
// import { useCart } from '@/store/useCart'; // Sesuaikan jika kamu pakai Zustand/Context

export function ProductDetailsContainer({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    // Logika simpan ke Keranjang (Zustand/Context/LocalStorage)
    console.log("Ditambahkan ke keranjang:", product.name, "Jumlah:", qty);
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    // Logika beli langsung (Redirect ke Checkout)
    handleAddToCart();
    // router.push('/cart'); 
  };

  return (
    <ProductDetails 
      product={{
        ...product,
        categoryName: product.category?.name || 'Kategori',
        reviewCount: 0, // Placeholder jika belum ada di DB
      }}
      qty={qty}
      setQty={setQty}
      handleAddToCart={handleAddToCart}
      handleBuyNow={handleBuyNow}
      formatRupiah={formatRupiah}
      // Tambahkan prop addedToCart jika ProductDetails mendukung UI feedback
    />
  );
}