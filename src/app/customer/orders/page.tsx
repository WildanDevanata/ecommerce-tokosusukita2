'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  Package,
  ShoppingBag,
  ChevronRight,
  Loader2,
  Search,
  X,
  AlertTriangle, // ➕ Tambahan icon untuk modal pembatalan
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
    { id: 'ALL', label: 'Semua' },
    { id: 'PENDING', label: 'Belum Bayar' },
    { id: 'CONFIRMED', label: 'Dikonfirmasi' },
    { id: 'PROCESSING', label: 'Diproses' },
    { id: 'SHIPPED', label: 'Dikirim' },
    { id: 'DELIVERED', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Dibatalkan' },
  ];

// ➕ Pilihan opsi alasan pembatalan agar user tidak repot mengetik
const CANCEL_REASONS = [
  "Ingin mengubah rincian pesanan (alamat, varian, kuantitas)",
  "Menemukan harga yang lebih murah di toko lain",
  "Salah memilih produk",
  "Tidak ingin membeli lagi",
  "Lainnya (Tulis alasan Anda di bawah)",
];

export default function OrdersPage() {
  const { orders, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ➕ State baru untuk manajemen Modal Pembatalan
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  // ================= FILTER DATA PESANAN =================

  const myOrders = orders.filter(
    (o: any) => o.userId === currentUser?.id
  );

  const filtered = myOrders.filter((order: any) => {
    const matchesTab = activeTab === 'ALL' || order.status === activeTab;
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower);

    const matchesProducts = order.items?.some((item: any) => {
      const productName = item.productName || item.name || '';
      return productName.toLowerCase().includes(searchLower);
    });

    return matchesTab && (searchQuery === '' || matchesOrderNumber || matchesProducts);
  });

  // ================= BUKA MODAL PEMBATALAN =================
  const handleOpenCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedReason(CANCEL_REASONS[0]);
    setCustomReason('');
    setIsCancelModalOpen(true);
  };

  // ================= PROSES SUBMIT PEMBATALAN =================
  const confirmCancelOrder = async () => {
    if (!selectedOrderId) return;

    // Tentukan teks alasan akhir yang akan disimpan ke field notes database
    const finalReason = selectedReason.startsWith("Lainnya")
      ? `Dibatalkan oleh pelanggan: ${customReason.trim() || 'Tanpa alasan spesifik'}`
      : `Dibatalkan oleh pelanggan: ${selectedReason}`;

    try {
      setCancellingId(selectedOrderId);
      setIsCancelModalOpen(false); // Tutup modal segera setelah konfirmasi ditekan

      const res = await fetch(`/api/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        // Mengirimkan status CANCELLED beserta alasan di field notes
        body: JSON.stringify({
          status: 'CANCELLED',
          notes: finalReason
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal membatalkan pesanan');
      }

      alert('Pesanan berhasil dibatalkan');
      window.location.reload();

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan sistem');
    } finally {
      setCancellingId(null);
      setSelectedOrderId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <nav className="text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600">Beranda</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800">Pesanan Saya</span>
            </nav>

            <h1 className="text-3xl font-black text-gray-800">Pesanan Saya</h1>
            <p className="text-gray-500 text-sm mt-1">
              Pantau status pesanan Anda secara realtime
            </p>
          </div>

          {/* Bar Pencarian */}
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Cari nomor pesanan (cth: ORD-17791...) atau nama susu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-[24px] pl-14 pr-12 py-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm mb-5">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const count = myOrders.filter((o: any) => {
                  const matchesTab = o.status === tab.id;
                  const searchLower = searchQuery.toLowerCase().trim();
                  const matchesOrderNumber = o.orderNumber?.toLowerCase().includes(searchLower);
                  const matchesProducts = o.items?.some((item: any) => (item.productName || item.name || '').toLowerCase().includes(searchLower));
                  return matchesTab && (searchQuery === '' || matchesOrderNumber || matchesProducts);
                }).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab.label}
                    {tab.id !== 'ALL' && count > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State / Not Found */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm py-20 px-6 text-center">
              <div className="text-7xl mb-5">📦</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                {searchQuery ? 'Pesanan Tidak Ditemukan' : 'Belum Ada Pesanan'}
              </h3>
              <p className="text-gray-400 mb-7">
                {searchQuery ? `Tidak ada hasil pencarian untuk "${searchQuery}"` : 'Pesanan Anda akan muncul di sini'}
              </p>
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200">
                  Reset Pencarian
                </button>
              ) : (
                <Link href="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  <ShoppingBag className="w-4 h-4" /> Mulai Belanja
                </Link>
              )}
            </div>
          ) : (
            /* Daftar Pesanan */
            <div className="space-y-5">
              {filtered.map((order: any) => (
                <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">

                  {/* Top Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-800">{order.orderNumber}</h3>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-4">
                    {order.items?.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100 overflow-hidden">
                          {item.image || item.productImage || item.productImageUrl ? (
                            <img
                              src={item.image || item.productImage || item.productImageUrl}
                              alt={item.productName || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : item.productEmoji || '🥛'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 truncate">{item.productName || item.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-blue-700">{formatRupiah(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-xs text-gray-400 mt-3">+{order.items.length - 2} produk lainnya</p>
                    )}

                    {/* Alasan pembatalan jika ada di kolom notes */}
                    {order.status === 'CANCELLED' && order.notes && (
                      <div className="mt-3 bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100">
                        📌 <strong>Alasan Pembatalan:</strong> {order.notes.replace("Dibatalkan oleh pelanggan: ", "")}
                      </div>
                    )}
                  </div>

                  {/* Footer Card */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pesanan</p>
                      <h3 className="text-2xl font-black text-blue-700 mt-1">{formatRupiah(order.totalAmount)}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
                        <>
                          {/* Button pemicu modal baru */}
                          <button
                            onClick={() => handleOpenCancelModal(order.id)}
                            disabled={cancellingId === order.id}
                            className="px-4 py-2 border border-red-300 text-red-500 rounded-2xl text-sm hover:bg-red-50 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            {cancellingId === order.id ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...</>
                            ) : 'Batalkan'}
                          </button>

                          <Link href={`/customer/orders/${order.id}`} className="px-4 py-2 bg-orange-500 text-white rounded-2xl text-sm hover:bg-orange-600">
                            Bayar Sekarang
                          </Link>
                        </>
                      )}

                      {order.paymentStatus === 'WAITING_VERIFICATION' && (
                        <span className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-2xl font-medium">
                          ⏳ Menunggu Verifikasi
                        </span>
                      )}

                      {order.status === 'SHIPPED' && order.trackingNumber && (
                        <span className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-2xl font-medium">
                          📦 {order.trackingNumber}
                        </span>
                      )}

                      <Link href={`/customer/orders/${order.id}`} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-blue-700">
                        Detail <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ➕ MODAL DIALOG POP-UP FORM ALASAN PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100">
            {/* Header Modal */}
            <div className="bg-red-50/50 p-6 pb-4 border-b border-gray-50 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">Batalkan Pesanan</h3>
                <p className="text-sm text-gray-500 mt-0.5">Beritahu kami alasan pembatalan Anda sebelum mengonfirmasi.</p>
              </div>
            </div>

            {/* Isi Form */}
            <div className="p-6 space-y-4">
              <label className="block text-sm font-bold text-gray-700">Pilih Alasan Utama:</label>
              <div className="space-y-2">
                {CANCEL_REASONS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReason === reason
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-medium'
                        : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                      }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              {/* Textarea muncul bersyarat jika memilih alasan 'Lainnya' */}
              {selectedReason.startsWith("Lainnya") && (
                <div className="space-y-1.5 animate-slideDown">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Tulis Alasan Kustom:</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alasan pembatalan Anda secara detail di sini..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                    required
                  />
                </div>
              )}
            </div>

            {/* Tombol Aksi Kaki Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={selectedReason.startsWith("Lainnya") && !customReason.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}