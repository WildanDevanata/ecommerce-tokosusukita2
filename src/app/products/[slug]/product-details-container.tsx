// src/app/products/[slug]/product-details-container.tsx

'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { ProductDetails } from '@/components/detailproducts/productdetail';

import { formatRupiah } from '@/lib/utils';

import { useApp } from '@/store/appcontext';

export function ProductDetailsContainer({
  product,
}: {
  product: any;
}) {
  const router = useRouter();

  const { addToCart } =
    useApp();

  const [qty, setQty] =
    useState(1);

  // ================= ADD TO CART =================

  const handleAddToCart =
    () => {
      for (
        let i = 0;
        i < qty;
        i++
      ) {
        addToCart(product);
      }

      console.log(
        'Ditambahkan ke keranjang:',
        product.name,
        'Jumlah:',
        qty
      );
    };

  // ================= BUY NOW =================

  const handleBuyNow =
    () => {
      // tambah ke cart dulu
      handleAddToCart();

      // redirect checkout
      router.push(
        '/customer/checkout'
      );
    };

  return (
    <ProductDetails
      product={{
        ...product,

        categoryName:
          product.category
            ?.name ||
          'Kategori',

        reviewCount: 0,
      }}
      qty={qty}
      setQty={setQty}
      handleAddToCart={
        handleAddToCart
      }
      handleBuyNow={
        handleBuyNow
      }
      formatRupiah={
        formatRupiah
      }
    />
  );
}