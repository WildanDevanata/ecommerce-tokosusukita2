'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductDetails } from '@/components/detailproducts/productdetail';
import { formatRupiah } from '@/lib/utils';
import { useApp } from '@/store/appcontext';

export function ProductDetailsContainer({ product }: { product: any }) {
  const router = useRouter();

  // 💡 Ambil state dan fungsi yang sesuai dengan AppContext kamu
  const { addToCart, updateCartQty, cart, currentUser } = useApp();
  const [qty, setQty] = useState(1);

  // 🛡️ Cek role berdasarkan data `currentUser` dari context kamu
  const isCustomer = currentUser?.role === 'CUSTOMER';

  // ================= ADD TO CART =================
  const handleAddToCart = (selectedQty: number) => {
    if (!isCustomer) return;

    const finalQty = selectedQty || qty;

    // Cek apakah item sudah ada di cart global
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Jika ada, tambahkan qty lama dengan qty baru yang dipilih
      updateCartQty(product.id, existingItem.quantity + finalQty);
    } else {
      // Jika belum ada, panggil addToCart untuk inisiasi item awal (quantity: 1)
      addToCart(product);
      // Jika user memilih beli > 1, update sisa qty-nya menggunakan updateCartQty
      if (finalQty > 1) {
        updateCartQty(product.id, finalQty);
      }
    }
  };

  // ================= BUY NOW =================
  const handleBuyNow = (selectedQty: number) => {
    if (!isCustomer) return;

    const finalQty = selectedQty || qty;

    // Sinkronisasi isi keranjang belanja terlebih dahulu
    handleAddToCart(finalQty);

    // Arahkan langsung ke halaman checkout dengan parameter kuantitas yang tepat
    router.push(`/customer/checkout?productId=${product.id}&qty=${finalQty}&direct=true`);
  };

  return (
    <ProductDetails
      product={{
        ...product,
        categoryName: product.category?.name || 'Kategori',
        reviewCount: product.reviewCount || 0,
        rating: product.rating || 5,
        soldCount: product.soldCount || 0
      }}
      qty={qty}
      setQty={setQty}
      handleAddToCart={handleAddToCart}
      handleBuyNow={handleBuyNow}
      formatRupiah={formatRupiah}
      isCustomer={isCustomer} // 👈 Teruskan status validasi role ke UI
    />
  );
}