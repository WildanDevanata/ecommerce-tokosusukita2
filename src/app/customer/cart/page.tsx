'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';
import { formatRupiah } from '@/lib/helpers';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';   

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQty } = useApp();
  const [loading, setLoading] = useState(true);

  // 1. Ambil data dari database saat halaman pertama kali dibuka
  useEffect(() => {
    async function fetchCartFromDb() {
      try {
        // Ganti 'user2' dengan variabel userId dinamis dari session/auth kamu jika sudah ada
        const response = await fetch('/api/cart?userId=user2');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Sinkronisasi data backend ke dalam state global appcontext kamu
          // Pastikan di dalam appContext kamu memiliki fungsi setStoreCart / sejenisnya jika dibutuhkan
        }
      } catch (error) {
        console.error("Gagal memuat data keranjang:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartFromDb();
  }, []);

  // Helper Adapter untuk memetakan nama properti database (product.name -> name)
  const getProductData = (item: any) => {
    if (item.product) {
      return {
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock ?? 99,
        categoryName: item.product.category?.name || 'Kategori'
      };
    }
    return {
      name: item.name,
      price: item.price,
      image: item.image,
      stock: item.stock ?? 99,
      categoryName: item.category?.name || item.category || 'Kategori'
    };
  };

  // Handler Hapus Item dengan Dialog Konfirmasi
  const handleRemoveWithConfirmation = (itemId: string, productName: string) => {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${productName}" dari keranjang?`
    );
    
    if (isConfirmed) {
      removeFromCart(itemId);
    }
  };

  // ================= HITUNG TOTAL =================
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => {
    const prod = getProductData(item);
    return acc + prod.price * item.quantity;
  }, 0);

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[75vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  // ================= KONDISI KOSONG =================
  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[75vh] items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
              <ShoppingBag className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Keranjang Masih Kosong</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Belum ada produk yang ditambahkan ke keranjang belanja Anda.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
            >
              <ShoppingBag className="h-5 w-5" />
              Mulai Belanja
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ================= HALAMAN UTAMA (DATA ADA) =================
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <span>/</span>
            <span className="font-medium text-gray-700">Keranjang Belanja</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-800">Keranjang Belanja</h1>
              <p className="mt-2 text-sm text-gray-500">{cartCount} item dalam keranjang</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                <Truck className="h-4 w-4" /> Dukung Cek Ongkir Instan
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                <ShieldCheck className="h-4 w-4" /> Produk Original
              </div>
            </div>
          </div>
        </div>

        {/* LIST ITEM */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {cart.map((item) => {
              const prod = getProductData(item);
              return (
                <div key={item.id} className="overflow-hidden rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex gap-5">
                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
                      <img src={prod.image || '/placeholder.png'} alt={prod.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-lg font-bold text-gray-800">{prod.name}</h2> 
                          <p className="mt-1 text-sm text-gray-400">{prod.categoryName}</p>
                        </div>
                        
                        {/* TOMBOL HAPUS DENGAN KONFIRMASI */}
                        <button 
                          onClick={() => handleRemoveWithConfirmation(item.id, prod.name)} 
                          className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-4">
                        <p className="text-2xl font-black text-blue-700">{formatRupiah(prod.price)}</p>
                      </div>

                      <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200">
                          {/* TOMBOL MINUS KINI TERKUNCI JIKA QUANTITY SEBESAR 1 */}
                          <button 
                            onClick={() => updateCartQty(item.id, item.quantity - 1)} 
                            disabled={item.quantity <= 1}
                            className="flex h-12 w-12 items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <div className="flex h-12 min-w-[60px] items-center justify-center border-x border-gray-200 text-sm font-bold text-gray-700">
                            {item.quantity}
                          </div>
                          
                          <button onClick={() => updateCartQty(item.id, Math.min(prod.stock, item.quantity + 1))} className="flex h-12 w-12 items-center justify-center transition-all hover:bg-gray-50">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subtotal</p>
                          <p className="mt-1 text-xl font-black text-gray-800">{formatRupiah(prod.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-xl font-black text-gray-800">Ringkasan Pesanan</h2>
              </div>
              <div className="space-y-6 p-6">
                <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Item Belanja</span>
                    {/* SINKRONISASI: Menampilkan jumlah kuantitas, bukan nilai uang */}
                    <span className="font-semibold text-gray-800">{cartCount} Item</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-gray-800">Subtotal</span>
                      <span className="text-3xl font-black text-blue-700">{formatRupiah(cartTotal)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => router.push('/customer/checkout')} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700">
                  Lanjut ke Pembayaran <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}