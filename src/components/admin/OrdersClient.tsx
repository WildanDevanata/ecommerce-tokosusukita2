'use client';

import { useState } from 'react';
import {
  Search,
  Eye,
  Truck,
  X,
} from 'lucide-react';

import {
  formatRupiah,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from '@/lib/helpers';

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export default function OrdersClient({
  orders,
}: {
  orders: any[];
}) {
  const [search, setSearch] =
    useState('');

  const [filterStatus, setFilterStatus] =
    useState('ALL');

  const [selectedOrder, setSelectedOrder] =
    useState<any | null>(null);

  const [trackingInput, setTrackingInput] =
    useState('');

  const [courierInput, setCourierInput] =
    useState('JNE');

  const filtered = orders.filter(
    (o: any) => {
      const matchSearch =
        o.orderNumber
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        o.userName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchStatus =
        filterStatus === 'ALL' ||
        o.status === filterStatus;

      return (
        matchSearch && matchStatus
      );
    }
  );

  // =========================
  // HANDLER
  // =========================

  const handleUpdateStatus = (
    orderId: string,
    status: OrderStatus
  ) => {
    setSelectedOrder((prev: any) =>
      prev
        ? {
            ...prev,
            status,
          }
        : null
    );
  };

  const handleSetTracking = () => {
    if (
      !trackingInput ||
      !selectedOrder
    )
      return;

    setSelectedOrder((prev: any) =>
      prev
        ? {
            ...prev,
            trackingNumber:
              trackingInput,
            courier:
              courierInput,
            status: 'SHIPPED',
          }
        : null
    );

    setTrackingInput('');
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Pesanan
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          {orders.length} total
          pesanan
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Cari pesanan, nama..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value
              )
            }
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
          >
            <option value="ALL">
              Semua Status
            </option>

            <option value="PENDING">
              Menunggu
            </option>

            <option value="CONFIRMED">
              Dikonfirmasi
            </option>

            <option value="PROCESSING">
              Diproses
            </option>

            <option value="SHIPPED">
              Dikirim
            </option>

            <option value="DELIVERED">
              Selesai
            </option>

            <option value="CANCELLED">
              Dibatalkan
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  'No',
                  'No. Pesanan',
                  'Customer',
                  'Produk',
                  'Total',
                  'Status',
                  'Pembayaran',
                  'Tanggal',
                  'Aksi',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map(
                (
                  order: any,
                  i: number
                ) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {i + 1}
                    </td>

                    <td className="px-4 py-3 text-blue-600 font-medium">
                      {
                        order.orderNumber
                      }
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                          {
                            order.userName?.[0]
                          }
                        </div>

                        <div>
                          <p className="text-sm">
                            {
                              order.userName
                            }
                          </p>

                          <p className="text-xs text-gray-400">
                            {
                              order.userEmail
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {
                        order.items
                          ?.length
                      }{' '}
                      item
                    </td>

                    <td className="px-4 py-3 font-bold text-blue-700">
                      {formatRupiah(
                        order.totalAmount
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(
                          order.status
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(
                          order.paymentStatus
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      {formatDate(
                        order.createdAt
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                        className="p-2 rounded-xl hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Tidak ada pesanan
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* HEADER */}
            <div className="px-7 py-5 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-800">
                    {
                      selectedOrder.orderNumber
                    }
                  </h2>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getOrderStatusLabel(
                      selectedOrder.status
                    )}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {
                    selectedOrder.userName
                  }{' '}
                  •{' '}
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto px-7 py-6 space-y-6">

              {/* STATUS */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Update Status
                </p>

                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      'CONFIRMED',
                      'PROCESSING',
                      'SHIPPED',
                      'DELIVERED',
                      'CANCELLED',
                    ] as OrderStatus[]
                  ).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleUpdateStatus(
                            selectedOrder.id,
                            status
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          selectedOrder.status ===
                          status
                            ? `${getOrderStatusColor(
                                status
                              )} border-current`
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {getOrderStatusLabel(
                          status
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* TRACKING */}
              {(selectedOrder.status ===
                'PROCESSING' ||
                selectedOrder.status ===
                  'SHIPPED') && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Informasi
                    Pengiriman
                  </p>

                  {selectedOrder.trackingNumber ? (
                    <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-purple-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-purple-700">
                          {
                            selectedOrder.trackingNumber
                          }
                        </p>

                        <p className="text-xs text-purple-500">
                          Kurir:{' '}
                          {
                            selectedOrder.courier
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <select
                        value={
                          courierInput
                        }
                        onChange={(
                          e
                        ) =>
                          setCourierInput(
                            e.target
                              .value
                          )
                        }
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-sm"
                      >
                        {[
                          'JNE',
                          'SiCepat',
                          'J&T',
                          'TIKI',
                          'POS',
                        ].map((c) => (
                          <option
                            key={c}
                          >
                            {c}
                          </option>
                        ))}
                      </select>

                      <input
                        value={
                          trackingInput
                        }
                        onChange={(
                          e
                        ) =>
                          setTrackingInput(
                            e.target
                              .value
                          )
                        }
                        placeholder="Masukkan nomor resi..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm"
                      />

                      <button
                        onClick={
                          handleSetTracking
                        }
                        className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm"
                      >
                        Simpan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Informasi
                  Pembayaran
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Metode
                      Pembayaran
                    </span>

                    <span className="text-sm font-medium">
                      {selectedOrder.paymentMethod ||
                        '-'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Status
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusLabel(
                        selectedOrder.paymentStatus
                      )}
                    </span>
                  </div>

                  {selectedOrder.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        No. Resi
                      </span>

                      <span className="text-sm font-medium">
                        {
                          selectedOrder.trackingNumber
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ITEMS */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Item Pesanan
                </p>

                <div className="space-y-3">
                  {selectedOrder.items?.map(
                    (
                      item: any
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className="flex items-center gap-4 bg-white rounded-2xl p-3 border border-gray-100"
                      >
                        <div
                          className={`${item.productBgColor} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}
                        >
                          {
                            item.productEmoji
                          }
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {
                              item.productName
                            }
                          </p>

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
              </div>

              {/* ADDRESS */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Alamat
                  Pengiriman
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {
                      selectedOrder
                        .shippingAddress
                        ?.recipientName
                    }
                  </p>

                  <p className="text-sm text-gray-600">
                    {
                      selectedOrder
                        .shippingAddress
                        ?.phone
                    }
                  </p>

                  <p className="text-sm text-gray-500 leading-relaxed">
                    {
                      selectedOrder
                        .shippingAddress
                        ?.address
                    }
                    ,{' '}
                    {
                      selectedOrder
                        .shippingAddress
                        ?.city
                    }
                    ,{' '}
                    {
                      selectedOrder
                        .shippingAddress
                        ?.province
                    }{' '}
                    {
                      selectedOrder
                        .shippingAddress
                        ?.postalCode
                    }
                  </p>
                </div>
              </div>

              {/* TOTAL */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total
                    Pembayaran
                  </p>

                  <p className="text-xs text-blue-400 mt-1">
                    Sudah termasuk
                    ongkir
                  </p>
                </div>

                <p className="text-2xl font-bold text-blue-700">
                  {formatRupiah(
                    selectedOrder.totalAmount
                  )}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-7 py-5 flex justify-end gap-3 bg-white">
              <button
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Tutup
              </button>

              <button className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
                Simpan
                Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}