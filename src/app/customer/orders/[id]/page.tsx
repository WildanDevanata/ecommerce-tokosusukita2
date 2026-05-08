'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Truck,
  MapPin,
  CreditCard,
} from 'lucide-react';

import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

import { useApp } from '@/store/appcontext';

import {
  formatRupiah,
  formatDateTime,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '@/lib/utils';

const statusTimeline = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const {
    orders,
    bankAccounts,
    uploadPaymentProof,
    cancelOrder,
  } = useApp();

  const [showUpload, setShowUpload] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [uploaded, setUploaded] =
    useState(false);

  const order = orders.find(
    (o) => o.id === id
  );

  if (!order) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">
              😕
            </div>

            <p className="text-gray-600">
              Pesanan tidak ditemukan
            </p>

            <Link
              href="/dashboard/customer/orders"
              className="text-blue-600 hover:underline mt-2 block"
            >
              Kembali ke Pesanan
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  const statusIndex =
    statusTimeline.indexOf(order.status);

  const activeBanks =
    bankAccounts.filter(
      (b) =>
        b.isActive &&
        b.type === 'BANK'
    );

  const handleUploadProof =
    async () => {
      setUploading(true);

      await new Promise((r) =>
        setTimeout(r, 1500)
      );

      await uploadPaymentProof(
        order.id,
        'https://dummyimage.com/400x400',
        'TRANSFER'
      );

      setUploaded(true);

      setUploading(false);

      setShowUpload(false);
    };

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-gray-800 text-2xl font-bold">
              Detail Pesanan
            </h1>

            <p className="text-gray-500 text-sm">
              {order.orderNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            {/* STATUS */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-800 font-semibold mb-5">
                Status Pesanan
              </h3>

              {order.status ===
              'CANCELLED' ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                  <span className="text-2xl">
                    ❌
                  </span>

                  <div>
                    <p className="font-medium text-red-700">
                      Pesanan
                      Dibatalkan
                    </p>

                    <p className="text-sm text-red-500">
                      {formatDateTime(
                        order.updatedAt
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 mx-8">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{
                        width: `${
                          (statusIndex /
                            (statusTimeline.length -
                              1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {statusTimeline.map(
                    (status, idx) => {
                      const passed =
                        idx <=
                        statusIndex;

                      const emojis = {
                        PENDING: '📋',
                        CONFIRMED: '✅',
                        PROCESSING:
                          '⚙️',
                        SHIPPED: '🚚',
                        DELIVERED:
                          '📦',
                      };

                      const labels = {
                        PENDING:
                          'Menunggu',
                        CONFIRMED:
                          'Dikonfirmasi',
                        PROCESSING:
                          'Diproses',
                        SHIPPED:
                          'Dikirim',
                        DELIVERED:
                          'Selesai',
                      };

                      return (
                        <div
                          key={status}
                          className="flex flex-col items-center relative z-10"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                              passed
                                ? 'bg-blue-600 shadow-md shadow-blue-200'
                                : 'bg-gray-100'
                            }`}
                          >
                            {passed ? (
                              <span>
                                {
                                  emojis[
                                    status as keyof typeof emojis
                                  ]
                                }
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                ○
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-xs mt-2 text-center hidden sm:block ${
                              passed
                                ? 'text-blue-600 font-medium'
                                : 'text-gray-400'
                            }`}
                          >
                            {
                              labels[
                                status as keyof typeof labels
                              ]
                            }
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-purple-600" />

                  <div>
                    <p className="text-sm text-purple-800">
                      No. Resi:{' '}
                      <span className="font-medium">
                        {
                          order.trackingNumber
                        }
                      </span>
                    </p>

                    <p className="text-xs text-purple-600">
                      Kurir:{' '}
                      {order.courier}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT */}
            {order.status ===
              'PENDING' &&
              order.paymentStatus ===
                'PENDING' &&
              order.paymentMethod ===
                'TRANSFER' && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h3 className="text-orange-800 font-semibold mb-4">
                    ⚠️ Selesaikan
                    Pembayaran
                  </h3>

                  <p className="text-sm text-orange-700 mb-4">
                    Silakan
                    transfer ke
                    salah satu
                    rekening
                    berikut:
                  </p>

                  {activeBanks.map(
                    (bank) => (
                      <div
                        key={bank.id}
                        className="bg-white rounded-xl p-4 mb-3 flex items-center gap-3"
                      >
                        <div
                          className={`w-10 h-10 ${bank.color} rounded-xl flex items-center justify-center text-white font-bold`}
                        >
                          {
                            bank.bankName.split(
                              ' '
                            )[1]?.[0]
                          }
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {
                              bank.bankName
                            }
                          </p>

                          <p className="text-sm font-bold text-gray-700">
                            {
                              bank.accountNumber
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            a.n.{' '}
                            {
                              bank.accountName
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  <div className="bg-white rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600">
                      Jumlah
                      Transfer
                    </p>

                    <p className="text-2xl font-bold text-blue-700">
                      {formatRupiah(
                        order.totalAmount
                      )}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Harap
                      transfer
                      tepat sesuai
                      nominal
                    </p>
                  </div>

                  {!uploaded &&
                  !order.paymentProofUrl ? (
                    <button
                      onClick={() =>
                        setShowUpload(
                          true
                        )
                      }
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl hover:bg-orange-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Bukti
                      Transfer
                    </button>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-700">
                      <CheckCircle2 className="w-5 h-5" />

                      <span className="text-sm">
                        Bukti
                        transfer
                        telah
                        diupload,
                        menunggu
                        verifikasi
                      </span>
                    </div>
                  )}

                  {showUpload && (
                    <div className="mt-3 border-2 border-dashed border-orange-300 rounded-xl p-6 text-center bg-white">
                      <div className="text-4xl mb-2">
                        📸
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        Upload
                        foto/screenshot
                        bukti
                        transfer
                      </p>

                      <button
                        onClick={
                          handleUploadProof
                        }
                        disabled={
                          uploading
                        }
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60"
                      >
                        {uploading
                          ? 'Mengupload...'
                          : 'Upload Bukti Transfer'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* ITEMS */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-gray-800 font-semibold mb-4">
                Item Pesanan
              </h3>

              {order.items?.map(
                (item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div className="bg-gray-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl">
                      📦
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {
                          item.productName
                        }
                      </p>

                      <p className="text-sm text-gray-500">
                        {
                          item.quantity
                        }{' '}
                        x{' '}
                        {formatRupiah(
                          item.price
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      {formatRupiah(
                        item.price *
                          item.quantity
                      )}
                    </span>
                  </div>
                )
              )}
            </div>

            {/* SHIPPING */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-blue-600" />

                <h3 className="text-gray-800 font-semibold">
                  Alamat
                  Pengiriman
                </h3>
              </div>

              <p className="font-medium text-gray-800">
                {
                  order.shippingAddress
                    ?.recipientName
                }
              </p>

              <p className="text-sm text-gray-500">
                {
                  order.shippingAddress
                    ?.phone
                }
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {
                  order.shippingAddress
                    ?.address
                }
                ,{' '}
                {
                  order.shippingAddress
                    ?.city
                }
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-blue-600" />

                <h3 className="text-gray-800 font-semibold">
                  Ringkasan
                  Bayar
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    {formatRupiah(
                      order.totalAmount -
                        (order.shippingCost ||
                          0)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>
                    Ongkos
                    Kirim
                  </span>

                  <span>
                    {order.shippingCost ===
                    0
                      ? 'GRATIS'
                      : formatRupiah(
                          order.shippingCost ||
                            0
                        )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span className="text-gray-800">
                    Total
                  </span>

                  <span className="text-blue-700">
                    {formatRupiah(
                      order.totalAmount
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {getOrderStatusLabel(
                      order.status
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Pembayaran
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {getPaymentStatusLabel(
                      order.paymentStatus
                    )}
                  </span>
                </div>

                {order.paymentMethod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Metode
                    </span>

                    <span className="text-gray-700">
                      {
                        order.paymentMethod
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.status ===
              'PENDING' &&
              order.paymentStatus ===
                'PENDING' && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Yakin ingin membatalkan pesanan?'
                      )
                    ) {
                      cancelOrder(
                        order.id
                      );
                    }
                  }}
                  className="w-full py-2.5 border border-red-300 text-red-500 rounded-2xl text-sm hover:bg-red-50"
                >
                  Batalkan
                  Pesanan
                </button>
              )}

            <Link
              href="/customer/orders"
              className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-2xl text-sm hover:bg-gray-50 flex items-center justify-center"
            >
              Kembali ke
              Pesanan
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}