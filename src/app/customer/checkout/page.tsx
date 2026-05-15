'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
} from 'lucide-react';

import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

import { useApp } from '@/store/appcontext';

// ================= TYPES =================

type PaymentMethod =
  | 'TRANSFER'
  | 'MIDTRANS'
  | 'COD'
  | 'EWALLET';

// ================= HELPERS =================

const formatRupiah = (
  value: number
) => {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }
  ).format(value);
};

// ================= PAGE =================

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    currentUser,
    bankAccounts,
  } = useApp();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      'TRANSFER'
    );

  const [selectedBank, setSelectedBank] =
    useState('');

  const [courier, setCourier] =
    useState('JNE');

  const [notes, setNotes] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  // ================= CALCULATIONS =================

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  const shippingCost =
    cartTotal >= 200000
      ? 0
      : 25000;

  const total =
    cartTotal + shippingCost;

  const activeBanks =
    bankAccounts.filter(
      (b) => b.isActive
    );

  const address =
    currentUser?.addresses?.find(
      (a) => a.isDefault
    ) ||
    currentUser?.addresses?.[0];

  // ================= REDIRECT =================

  useEffect(() => {
    if (cart.length === 0) {
      router.push(
        '/customer/cart'
      );
    }
  }, [cart, router]);

  if (cart.length === 0) {
    return null;
  }

  // ================= HANDLER =================

  const handlePlaceOrder =
    async () => {
      if (!currentUser || !address)
        return;

      try {
        setLoading(true);

        const payload = {
          userId: currentUser.id,

          totalAmount: total,

          shippingCost,

          paymentMethod,

          courier,

          notes,

          paymentStatus:
            'PENDING',

          status: 'PENDING',

          shippingRecipient:
            address.recipientName,

          shippingPhone:
            address.phone,

          shippingAddress:
            address.address,

          shippingCity:
            address.city,

          shippingProvince:
            address.province,

          shippingPostalCode:
            address.postalCode,

          items: cart.map(
            (item) => ({
              productId: item.id,
              quantity:
                item.quantity,
              price: item.price,
            })
          ),
        };

        const res = await fetch(
          '/api/orders',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

        if (!res.ok) {
          throw new Error(
            'Gagal membuat pesanan'
          );
        }

        const order =
          await res.json();

        localStorage.removeItem(
          'cart'
        );

        router.push(
          `/customer/orders/${order.id}`
        );
      } catch (err) {
        console.error(err);

        alert(
          'Gagal membuat pesanan'
        );
      } finally {
        setLoading(false);
      }
    };

  // ================= PAYMENT METHODS =================

  const paymentMethods = [
    {
      id: 'TRANSFER',
      label: 'Transfer Bank',
      desc:
        'Transfer ke rekening toko',
      emoji: '🏦',
    },

    {
      id: 'MIDTRANS',
      label:
        'Bayar Online (Midtrans)',
      desc:
        'Kartu kredit, debit, dll',
      emoji: '💳',
    },

    {
      id: 'EWALLET',
      label: 'E-Wallet',
      desc:
        'GoPay, OVO, Dana',
      emoji: '📱',
    },

    {
      id: 'COD',
      label:
        'Bayar di Tempat (COD)',
      desc:
        'Bayar saat paket tiba',
      emoji: '📦',
    },
  ] as const;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Breadcrumb */}
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

              <Link
                href="/customer/cart"
                className="hover:text-blue-600"
              >
                Keranjang
              </Link>

              <span className="mx-2">
                /
              </span>

              <span className="text-gray-800">
                Checkout
              </span>
            </nav>

            <h1 className="text-3xl font-black text-gray-800">
              Checkout
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-5">
              {/* ADDRESS */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />

                    <h3 className="text-gray-800 font-bold">
                      Alamat
                      Pengiriman
                    </h3>
                  </div>

                  <Link
                    href="/customer/profile"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ubah
                  </Link>
                </div>

                {address ? (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Utama
                    </span>

                    <p className="font-medium text-gray-800 mt-2">
                      {
                        address.recipientName
                      }
                    </p>

                    <p className="text-sm text-gray-600">
                      {address.phone}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {
                        address.address
                      }
                      , {address.city},{' '}
                      {
                        address.province
                      }{' '}
                      {
                        address.postalCode
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Belum ada alamat
                      pengiriman
                    </p>

                    <Link
                      href="/customer/profile"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Tambah Alamat
                    </Link>
                  </div>
                )}
              </div>

              {/* COURIER */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-blue-600" />

                  <h3 className="text-gray-800 font-bold">
                    Pilih Kurir
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'JNE',
                    'SiCepat',
                    'J&T',
                    'Pos Indonesia',
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        setCourier(c)
                      }
                      className={`py-2 px-3 rounded-xl border text-sm transition-colors ${
                        courier === c
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Estimasi 2-4 hari
                  kerja •{' '}
                  {formatRupiah(
                    shippingCost
                  )}
                </p>
              </div>

              {/* PAYMENT */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />

                  <h3 className="text-gray-800 font-bold">
                    Metode Pembayaran
                  </h3>
                </div>

                {/* PAYMENT METHODS */}
                <div className="space-y-2 mb-4">
                  {paymentMethods.map(
                    (method) => (
                      <label
                        key={
                          method.id
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethod ===
                          method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="radio"
                          checked={
                            paymentMethod ===
                            method.id
                          }
                          onChange={() =>
                            setPaymentMethod(
                              method.id as PaymentMethod
                            )
                          }
                          className="sr-only"
                        />

                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod ===
                            method.id
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}
                        />

                        <span className="text-lg">
                          {
                            method.emoji
                          }
                        </span>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {
                              method.label
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              method.desc
                            }
                          </p>
                        </div>
                      </label>
                    )
                  )}
                </div>

                {/* TRANSFER */}
                {paymentMethod ===
                  'TRANSFER' && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-800 mb-3">
                      Pilih Rekening
                      Tujuan:
                    </p>

                    <div className="space-y-2">
                      {activeBanks
                        .filter(
                          (b) =>
                            b.type ===
                            'BANK'
                        )
                        .map((bank) => (
                          <label
                            key={
                              bank.id
                            }
                            className={`flex items-center gap-3 p-2.5 rounded-xl bg-white border cursor-pointer ${
                              selectedBank ===
                              bank.id
                                ? 'border-blue-600'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              checked={
                                selectedBank ===
                                bank.id
                              }
                              onChange={() =>
                                setSelectedBank(
                                  bank.id
                                )
                              }
                              className="sr-only"
                            />

                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 ${
                                selectedBank ===
                                bank.id
                                  ? 'border-blue-600 bg-blue-600'
                                  : 'border-gray-300'
                              }`}
                            />

                            <div
                              className={`${bank.color} w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {bank.bankName
                                .split(
                                  ' '
                                )[1]?.[0] ||
                                bank
                                  .bankName?.[0]}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {
                                  bank.bankName
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  bank.accountNumber
                                }{' '}
                                a.n.{' '}
                                {
                                  bank.accountName
                                }
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>

                    <p className="text-xs text-orange-700 mt-3">
                      ⚠️ Setelah
                      transfer,
                      upload bukti
                      pembayaran di
                      halaman detail
                      pesanan
                    </p>
                  </div>
                )}

                {/* EWALLET */}
                {paymentMethod ===
                  'EWALLET' && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-green-800 mb-3">
                      Pilih E-Wallet:
                    </p>

                    <div className="space-y-2">
                      {activeBanks
                        .filter(
                          (b) =>
                            b.type ===
                            'EWALLET'
                        )
                        .map((wallet) => (
                          <label
                            key={
                              wallet.id
                            }
                            className={`flex items-center gap-3 p-2.5 rounded-xl bg-white border cursor-pointer ${
                              selectedBank ===
                              wallet.id
                                ? 'border-green-600'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              checked={
                                selectedBank ===
                                wallet.id
                              }
                              onChange={() =>
                                setSelectedBank(
                                  wallet.id
                                )
                              }
                              className="sr-only"
                            />

                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 ${
                                selectedBank ===
                                wallet.id
                                  ? 'border-green-600 bg-green-600'
                                  : 'border-gray-300'
                              }`}
                            />

                            <div
                              className={`${wallet.color} w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {
                                wallet.bankName?.[0]
                              }
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {
                                  wallet.bankName
                                }
                              </p>

                              <p className="text-xs text-gray-500">
                                {
                                  wallet.accountNumber
                                }{' '}
                                a.n.{' '}
                                {
                                  wallet.accountName
                                }
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* MIDTRANS */}
                {paymentMethod ===
                  'MIDTRANS' && (
                  <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                    💳 Anda akan
                    diarahkan ke
                    halaman Midtrans
                    setelah pesanan
                    dibuat.
                  </div>
                )}

                {/* COD */}
                {paymentMethod ===
                  'COD' && (
                  <div className="bg-orange-50 rounded-xl p-4 text-sm text-orange-700">
                    📦 Bayar langsung
                    ke kurir saat
                    pesanan tiba.
                  </div>
                )}

                {/* NOTES */}
                <div className="mt-5">
                  <h3 className="text-gray-800 mb-3 font-bold">
                    Catatan Pesanan
                    (Opsional)
                  </h3>

                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Contoh: Tolong dibungkus rapi..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                <h3 className="text-gray-800 font-bold mb-4">
                  Detail Pesanan
                </h3>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {cart.map((item) => (
  <div key={item.id} className="flex items-center gap-3"> {/* Jarak gap diperbesar sedikit agar rapi */}
    {/* CONTAINER FOTO */}
    <div className={`${item.bgColor || 'bg-gray-100'} w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50`}>
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover" // object-cover agar gambar memenuhi kotak tanpa distorsi
          onError={(e) => {
            // Fallback jika URL gambar rusak
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=📦';
          }}
        />
      ) : (
        <span className="text-xl">🛒</span>
      )}
    </div>

    {/* INFO PRODUK */}
    <div className="flex-1 min-w-0"> {/* min-w-0 penting agar teks panjang bisa terpotong/wrap dengan baik */}
      <p className="text-xs font-bold text-gray-800 truncate">
        {item.name}
      </p>

      <p className="text-[10px] text-gray-500 mt-0.5">
        {item.quantity} x {formatRupiah(item.price)}
      </p>
    </div>

    {/* SUBTOTAL PER ITEM */}
    <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
      {formatRupiah(item.price * item.quantity)}
    </span>
  </div>
))}
                </div>

                <div className="space-y-2 py-3 border-y border-gray-100 mb-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatRupiah(
                        cartTotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>
                      Ongkir (
                      {courier})
                    </span>

                    <span
                      className={
                        shippingCost ===
                        0
                          ? 'text-green-600 font-medium'
                          : ''
                      }
                    >
                      {shippingCost ===
                      0
                        ? 'GRATIS'
                        : formatRupiah(
                            shippingCost
                          )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mb-5 font-medium">
                  <span className="text-gray-800">
                    Total
                  </span>

                  <span className="text-blue-700 text-lg">
                    {formatRupiah(
                      total
                    )}
                  </span>
                </div>

                <button
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    loading ||
                    !address
                  }
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}

                  {loading
                    ? 'Memproses...'
                    : 'Buat Pesanan'}
                </button>

                {!address && (
                  <p className="text-xs text-red-500 text-center mt-2">
                    Tambahkan alamat
                    pengiriman terlebih
                    dahulu
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}