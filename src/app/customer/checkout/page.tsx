'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

import {
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

import CourierSelect from '@/components/customer/CourierSelect';
import OngkirResult from '@/components/customer/OngkirResult';

import { useApp } from '@/store/appcontext';

import type {
  Courier,
  CourierResult,
  SelectedShipping,
} from '@/lib/types';

import citiesData from '@/lib/cities.json';

// ================= HELPERS =================

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

// ================= TYPES =================

type PaymentMethod =
  | 'TRANSFER'
  | 'MIDTRANS'
  | 'EWALLET';

// ================= COMPONENT =================

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cart,
    currentUser,
    bankAccounts,
    refreshOrders,
  } = useApp();

  // ================= STATE =================

  const [isHydrated, setIsHydrated] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('TRANSFER');

  const [selectedBank, setSelectedBank] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  // ================= ONGKIR =================

  const [courier, setCourier] =
    useState<Courier>('jne');

  const [loadingOngkir, setLoadingOngkir] =
    useState(false);

  const [ongkirResults, setOngkirResults] =
    useState<CourierResult[]>([]);

  const [selectedShipping, setSelectedShipping] =
    useState<SelectedShipping | null>(null);

  // ================= HYDRATE =================

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ================= REDIRECT =================

  useEffect(() => {
    if (
      isHydrated &&
      cart &&
      cart.length === 0
    ) {
      router.push('/customer/cart');
    }
  }, [cart, isHydrated, router]);

  // ================= ADDRESS =================

  const address =
    currentUser?.addresses?.find(
      (a) => a.isDefault
    ) || currentUser?.addresses?.[0];

  // ================= FETCH ONGKIR =================

  useEffect(() => {
    async function fetchOngkir() {
      if (!address?.city || !courier) return;

      try {
        setLoadingOngkir(true);

        // Cari kota tujuan berdasarkan nama kota user
        const foundCity = citiesData.find(
          (city: any) =>
            city.city_name
              .toLowerCase()
              .trim() ===
            address.city
              .toLowerCase()
              .trim()
        );

        if (!foundCity) {
          console.error(
            'Kota tidak ditemukan:',
            address.city
          );

          setOngkirResults([]);

          return;
        }

        const response = await fetch(
          '/api/rajaongkir/cost',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              origin:
                process.env
                  .NEXT_PUBLIC_SELLER_CITY_ID ||
                '501',

              destination:
                foundCity.city_id,

              courier,

              weight: 1000,
            }),
          }
        );

        const result =
          await response.json();

        console.log(
          'ONGKIR RESPONSE:',
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              'Gagal mengambil ongkir'
          );
        }

        // SUPPORT 2 FORMAT RESPONSE
        if (Array.isArray(result)) {
          setOngkirResults(result);
        } else if (
          result?.data &&
          Array.isArray(result.data)
        ) {
          setOngkirResults(result.data);
        } else {
          setOngkirResults([]);
        }
      } catch (error) {
        console.error(
          'FETCH ONGKIR ERROR:',
          error
        );

        setOngkirResults([]);
      } finally {
        setLoadingOngkir(false);
      }
    }

    fetchOngkir();
  }, [address?.city, courier]);

  // ================= LOADING =================

  if (!isHydrated || !cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />

        <p className="text-sm text-gray-500 font-medium">
          Memuat data checkout...
        </p>
      </div>
    );
  }

  if (cart.length === 0) return null;

  // ================= CALCULATIONS =================

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  const shippingCost =
    selectedShipping?.cost || 0;

  const total =
    cartTotal + shippingCost;

  const activeBanks = bankAccounts
    ? bankAccounts.filter(
        (b) => b.isActive
      )
    : [];

  // ================= PLACE ORDER =================

  const handlePlaceOrder =
    async () => {
      if (!currentUser || !address)
        return;

      if (!selectedShipping) {
        alert(
          'Pilih layanan pengiriman terlebih dahulu'
        );

        return;
      }

      try {
        setLoading(true);

       const payload = {
  userId: currentUser.id,

  totalAmount: total,

  shippingCost:
    selectedShipping.cost,

  paymentMethod,

  courier:
    selectedShipping.courier.toUpperCase(),

  shippingService:
    selectedShipping.service,

  shippingEtd:
    selectedShipping.etd,

  notes,

  paymentStatus: 'PENDING',

  status: 'PENDING',

  shippingRecipient:
    address.recipientName,

  shippingPhone: address.phone,

  shippingAddress: address.address,

  shippingCity: address.city,

  shippingProvince:
    address.province,

  shippingPostalCode:
    address.postalCode,

  items: cart.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    price: item.price,
  })),
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

        await refreshOrders();

        localStorage.removeItem(
          'cart'
        );

        // ================= MIDTRANS =================

        if (
          paymentMethod ===
          'MIDTRANS'
        ) {
          if (
            order.snapToken &&
            (window as any).snap
          ) {
            (window as any).snap.pay(
              order.snapToken,
              {
                onSuccess:
                  async () => {
                    try {
                      await fetch(
  `/api/orders/${order.orderNumber}`,
                        {
                          method:
                            'PATCH',

                          headers: {
                            'Content-Type':
                              'application/json',
                          },

                          body: JSON.stringify(
                            {
                              paymentStatus:
                                'PAID',

                              status:
                                'CONFIRMED',
                            }
                          ),
                        }
                      );
                    } catch (err) {
                      console.error(
                        err
                      );
                    }

                    await refreshOrders();

                    router.push(
  `/customer/orders/${order.orderNumber}`
);
                  },

                onPending: () => {
                  router.push(
                    `/customer/orders/${order.orderNumber}`
                  );
                },

                onError: () => {
                  alert(
                    'Pembayaran gagal'
                  );

                  router.push(
                    `/customer/orders/${order.orderNumber}`
                  );
                },

                onClose: () => {
                  router.push(
                    `/customer/orders/${order.orderNumber}`
                  );
                },
              }
            );
          }
        } else {
          router.push(
            `/customer/orders/${order.orderNumber}`
          );
        }
      } catch (error) {
        console.error(error);

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
      id: 'MIDTRANS',
      label: 'QRIS (Midtrans)',
      desc: 'QRIS & VA',
      emoji: '💳',
    },

    {
      id: 'TRANSFER',
      label: 'Transfer Bank',
      desc: 'Transfer manual',
      emoji: '🏦',
    },

    {
      id: 'EWALLET',
      label: 'E-Wallet',
      desc: 'OVO / Dana / GoPay',
      emoji: '📱',
    },
  ] as const;

  // ================= UI =================

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={
          process.env
            .NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
        }
        strategy="lazyOnload"
      />

      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">

          {/* HEADER */}

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
                      Alamat Pengiriman
                    </h3>
                  </div>

                  <Link
                    href="/customer/profile?tab=address"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ubah
                  </Link>
                </div>

                {address ? (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="font-medium text-gray-800">
                      {
                        address.recipientName
                      }
                    </p>

                    <p className="text-sm text-gray-600">
                      {address.phone}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {address.address},{' '}
                      {address.city},{' '}
                      {
                        address.province
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-500">
                    Belum ada alamat
                  </p>
                )}
              </div>

              {/* COURIER */}

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-800 mb-4">
                  Pilih Kurir
                </h3>

                <CourierSelect
                  selected={courier}
                  onChange={(
                    value
                  ) => {
                    setCourier(
                      value
                    );

                    setSelectedShipping(
                      null
                    );
                  }}
                />

                <div className="mt-5">
                  <OngkirResult
                    results={
                      ongkirResults
                    }
                    selected={
                      selectedShipping
                    }
                    onSelect={(
                      shipping
                    ) => {
                      setSelectedShipping(
                        shipping
                      );
                    }}
                    loading={
                      loadingOngkir
                    }
                  />
                </div>
              </div>

              {/* PAYMENT */}

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />

                  <h3 className="font-bold text-gray-800">
                    Metode Pembayaran
                  </h3>
                </div>

                <div className="space-y-2">
                  {paymentMethods.map(
                    (method) => (
                      <label
                        key={
                          method.id
                        }
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                          paymentMethod ===
                          method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200'
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
                              method.id
                            )
                          }
                          className="sr-only"
                        />

                        <span className="text-xl">
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

                <div className="mt-5">
                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target
                          .value
                      )
                    }
                    rows={3}
                    placeholder="Catatan pesanan..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">

                <h3 className="font-bold text-gray-800 mb-4">
                  Detail Pesanan
                </h3>

                <div className="space-y-3 mb-4">
                  {cart.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="flex justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {
                              item.name
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            {
                              item.quantity
                            }{' '}
                            x{' '}
                            {formatRupiah(
                              item.price
                            )}
                          </p>
                        </div>

                        <p className="text-sm font-bold">
                          {formatRupiah(
                            item.price *
                              item.quantity
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">

                  <div className="flex justify-between text-sm">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      {formatRupiah(
                        cartTotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>
                      Ongkir
                    </span>

                    <span>
                      {formatRupiah(
                        shippingCost
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>

                    <span className="text-blue-700">
                      {formatRupiah(
                        total
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    loading ||
                    loadingOngkir ||
                    !selectedShipping
                  }
                  className="w-full mt-5 bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
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
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}