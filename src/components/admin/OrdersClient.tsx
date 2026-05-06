'use client';

import { useState } from 'react';
import { Search, Eye, Truck, X } from 'lucide-react';
import {
  formatRupiah,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor
} from '@/lib/helpers';

export default function OrdersClient({ orders }: any) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('JNE');

  const filtered = orders.filter((o: any) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'ALL' || o.status === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-gray-800">Manajemen Pesanan</h1>
        <p className="text-gray-500 text-sm">{orders.length} total pesanan</p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pesanan, nama..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="PAID">Dibayar</option>
            <option value="SHIPPED">Dikirim</option>
            <option value="DELIVERED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['No','No. Pesanan','Customer','Produk','Total','Status','Pembayaran','Tanggal','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((order: any, i: number) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-blue-600">{order.orderNumber}</td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                        {order.userName[0]}
                      </div>
                      <div>
                        <p className="text-sm">{order.userName}</p>
                        <p className="text-xs text-gray-400">{order.userEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs">
                    {order.items.length} item
                  </td>

                  <td className="px-4 py-3 font-bold text-blue-700">
                    {formatRupiah(order.totalAmount)}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs">
                    {formatDate(order.createdAt)}
                  </td>

                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xl">
            <h3>{selectedOrder.orderNumber}</h3>
            <p>{selectedOrder.userName}</p>

            <button onClick={() => setSelectedOrder(null)}>
              <X />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}