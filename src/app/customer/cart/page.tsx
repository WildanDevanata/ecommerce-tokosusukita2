'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';
import { formatRupiah } from '@/lib/helpers';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';   

export default function CartPage() {
  const router = useRouter();

  const {
    cart,
    removeFromCart,
    updateCartQty,
  } = useApp();

  // ================= TOTAL =================

  const cartCount = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (acc, item) =>
      acc + item.price * item.quantity,
    0
  );

  const shippingCost =
    cartTotal >= 200000 ? 0 : 25000;

  const total = cartTotal + shippingCost;

  // ================= EMPTY =================

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
      <div className="flex min-h-[75vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">
            <ShoppingBag className="h-12 w-12 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Keranjang Masih Kosong
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Belum ada produk yang ditambahkan ke
            keranjang belanja Anda.
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

  // ================= PAGE =================

  return (
    <>
      <Navbar />
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Beranda
          </Link>

          <span>/</span>

          <span className="font-medium text-gray-700">
            Keranjang Belanja
          </span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-800">
              Keranjang Belanja
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {cartCount} item dalam keranjang
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <Truck className="h-4 w-4" />
              Gratis ongkir min. Rp200rb
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Produk Original
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CART ITEMS */}
        <div className="space-y-5 lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex gap-5">
                {/* IMAGE */}
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50">
                  <img
                    src={
                      item.image ||
                      '/placeholder.png'
                    }
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex min-w-0 flex-1 flex-col">
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-lg font-bold text-gray-800">
                        {item.name}
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        {(item as any)
                          ?.category?.name ||
                          item.categoryName}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {/* PRICE */}
                  <div className="mt-4">
                    <p className="text-2xl font-black text-blue-700">
                      {formatRupiah(item.price)}
                    </p>

                    {(item as any)
                      ?.originalPrice && (
                      <p className="mt-1 text-sm text-gray-400 line-through">
                        {formatRupiah(
                          (item as any)
                            .originalPrice
                        )}
                      </p>
                    )}
                  </div>

                  {/* BOTTOM */}
                  <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* QTY */}
                    <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200">
                      <button
                        onClick={() =>
                          updateCartQty(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        className="flex h-12 w-12 items-center justify-center transition-all hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <div className="flex h-12 min-w-[60px] items-center justify-center border-x border-gray-200 text-sm font-bold text-gray-700">
                        {item.quantity}
                      </div>

                      <button
                        onClick={() =>
                          updateCartQty(
                            item.id,
                            Math.min(
                              item.stock,
                              item.quantity + 1
                            )
                          )
                        }
                        className="flex h-12 w-12 items-center justify-center transition-all hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* SUBTOTAL */}
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Subtotal
                      </p>

                      <p className="mt-1 text-xl font-black text-gray-800">
                        {formatRupiah(
                          item.price *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
            {/* HEADER */}
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-black text-gray-800">
                Ringkasan Pesanan
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Periksa kembali pesanan Anda
              </p>
            </div>

            {/* BODY */}
            <div className="space-y-6 p-6">
              {/* PROMO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Kode Promo
                </label>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      placeholder="Masukkan kode"
                      className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <button className="h-12 rounded-2xl bg-gray-100 px-5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200">
                    Pakai
                  </button>
                </div>
              </div>

              {/* PRICE */}
              <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-gray-800">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Ongkos Kirim
                  </span>

                  <span
                    className={
                      shippingCost === 0
                        ? 'font-bold text-green-600'
                        : 'font-semibold text-gray-800'
                    }
                  >
                    {shippingCost === 0
                      ? 'GRATIS'
                      : formatRupiah(
                          shippingCost
                        )}
                  </span>
                </div>

                {cartTotal < 200000 && (
                  <div className="rounded-2xl bg-blue-100 px-4 py-3 text-xs font-medium text-blue-700">
                    💡 Tambah belanja{' '}
                    {formatRupiah(
                      200000 - cartTotal
                    )}{' '}
                    lagi untuk mendapatkan
                    gratis ongkir.
                  </div>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-800">
                      Total Pembayaran
                    </span>

                    <span className="text-3xl font-black text-blue-700">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION */}
              <div className="space-y-3">
                <button
                  onClick={() =>
                    router.push(
                      '/customer/checkout'
                    )
                  }
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700"
                >
                  Lanjut ke Pembayaran

                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  href="/products"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}