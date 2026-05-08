'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  Package,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';

import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

import { useApp } from '@/store/appcontext';

import {
  formatRupiah,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '@/lib/utils';

// ================= TABS =================

const tabs: {
  id: string;
  label: string;
}[] = [
  {
    id: 'ALL',
    label: 'Semua',
  },
  {
    id: 'PENDING',
    label: 'Belum Bayar',
  },
  {
    id: 'CONFIRMED',
    label: 'Dikonfirmasi',
  },
  {
    id: 'PROCESSING',
    label: 'Diproses',
  },
  {
    id: 'SHIPPED',
    label: 'Dikirim',
  },
  {
    id: 'DELIVERED',
    label: 'Selesai',
  },
  {
    id: 'CANCELLED',
    label: 'Dibatalkan',
  },
];

export default function OrdersPage() {
  const {
    orders,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] =
    useState('ALL');

  // ================= FILTER =================

  const myOrders = orders.filter(
    (o: any) =>
      o.userId === currentUser?.id
  );

  const filtered =
    activeTab === 'ALL'
      ? myOrders
      : myOrders.filter(
          (o: any) =>
            o.status === activeTab
        );

  // ================= CANCEL ORDER =================

  const cancelOrder = (
    orderId: string
  ) => {
    alert(
      `Batalkan pesanan ${orderId}`
    );

    // nanti sambungkan ke API / context
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="text-sm text-gray-500 mb-2">
              <Link
                href="/"
                className="hover:text-blue-600"
              >
                Beranda
              </Link>

              <span className="mx-2">
                /
              </span>

              <span className="text-gray-800">
                Pesanan Saya
              </span>
            </nav>

            <h1 className="text-3xl font-black text-gray-800">
              Pesanan Saya
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Pantau status pesanan
              Anda secara realtime
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm mb-5">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}

                  {tab.id !== 'ALL' &&
                    myOrders.filter(
                      (o: any) =>
                        o.status ===
                        tab.id
                    ).length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">
                        {
                          myOrders.filter(
                            (
                              o: any
                            ) =>
                              o.status ===
                              tab.id
                          ).length
                        }
                      </span>
                    )}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-20 px-6 text-center">
              <div className="text-7xl mb-5">
                📦
              </div>

              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                Belum Ada Pesanan
              </h3>

              <p className="text-gray-400 mb-7">
                Pesanan Anda akan
                muncul di sini
              </p>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <ShoppingBag className="w-4 h-4" />
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map(
                (order: any) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Top Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="font-black text-gray-800">
                            {
                              order.orderNumber
                            }
                          </h3>

                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {getOrderStatusLabel(
                            order.status
                          )}
                        </span>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusLabel(
                            order.paymentStatus
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-6 py-4">
                      {order.items
                        ?.slice(0, 2)
                        .map(
                          (
                            item: any
                          ) => (
                            <div
                              key={
                                item.id
                              }
                              className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0"
                            >
                              {/* Product Image */}
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl flex-shrink-0">
                                {item.productEmoji ||
                                  '📦'}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 truncate">
                                  {
                                    item.productName
                                  }
                                </h4>

                                <p className="text-xs text-gray-500 mt-1">
                                  {
                                    item.quantity
                                  }
                                  x{' '}
                                  {formatRupiah(
                                    item.price
                                  )}
                                </p>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                <p className="text-sm font-black text-blue-700">
                                  {formatRupiah(
                                    item.price *
                                      item.quantity
                                  )}
                                </p>
                              </div>
                            </div>
                          )
                        )}

                      {order.items
                        ?.length > 2 && (
                        <p className="text-xs text-gray-400 mt-3">
                          +
                          {order.items
                            .length -
                            2}{' '}
                          produk lainnya
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 border-t border-gray-100">
                      {/* Total */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Total Pesanan
                        </p>

                        <h3 className="text-2xl font-black text-blue-700 mt-1">
                          {formatRupiah(
                            order.totalAmount
                          )}
                        </h3>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Pending */}
                        {order.status ===
                          'PENDING' &&
                          order.paymentStatus ===
                            'PENDING' && (
                            <>
                              <button
                                onClick={() =>
                                  cancelOrder(
                                    order.id
                                  )
                                }
                                className="px-4 py-2 border border-red-300 text-red-500 rounded-2xl text-sm hover:bg-red-50 transition-all"
                              >
                                Batalkan
                              </button>

                              <Link
                                href={`/customer/orders/${order.id}`}
                                className="px-4 py-2 bg-orange-500 text-white rounded-2xl text-sm hover:bg-orange-600 transition-all"
                              >
                                Bayar Sekarang
                              </Link>
                            </>
                          )}

                        {/* Waiting */}
                        {order.paymentStatus ===
                          'WAITING_VERIFICATION' && (
                          <span className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-2xl font-medium">
                            ⏳ Menunggu
                            Verifikasi
                          </span>
                        )}

                        {/* Tracking */}
                        {order.status ===
                          'SHIPPED' &&
                          order.trackingNumber && (
                            <span className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl font-medium">
                              📦{' '}
                              {
                                order.trackingNumber
                              }
                            </span>
                          )}

                        {/* Detail */}
                        <Link
                          href={`/customer/orders/${order.id}`}
                          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-blue-700 transition-all"
                        >
                          Detail

                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}