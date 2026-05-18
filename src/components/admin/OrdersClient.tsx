'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Eye,
  Truck,
  X,
  CheckCircle,
  Loader2,
  Clock,
  Settings,
  Package,
  CheckCircle2,
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
  orders: initialOrders,
}: {
  orders: any[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('JNE');
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const filtered = orders.filter((o: any) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.userName.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Helper untuk menentukan urutan index step progres
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return -1; // Untuk CANCELLED
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setLoadingStatus(status);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || 'Gagal memperbarui status');
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId 
            ? { ...o, status, ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}) } 
            : o
        )
      );

      setSelectedOrder((prev: any) =>
        prev && prev.id === orderId 
          ? { ...prev, status, ...(status === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}) } 
          : prev
      );

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setLoadingStatus(null);
    }
  };

  const handleSetTracking = async () => {
    if (!trackingInput || !selectedOrder) return;

    setLoadingStatus('SHIPPED');
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingInput,
          courier: courierInput,
          status: 'SHIPPED',
        }),
      });

      if (!res.ok) {
        alert('Gagal menyimpan nomor resi');
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, trackingNumber: trackingInput, courier: courierInput, status: 'SHIPPED' }
            : o
        )
      );

      setSelectedOrder((prev: any) =>
        prev
          ? { ...prev, trackingNumber: trackingInput, courier: courierInput, status: 'SHIPPED' }
          : null
      );

      setTrackingInput('');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setLoadingStatus(null);
    }
  };

  // Definisi komponen langka stepper
  const steps = [
    { label: 'Dikonfirmasi', icon: Clock },
    { label: 'Diproses', icon: Settings },
    { label: 'Dikirim', icon: Package },
    { label: 'Selesai', icon: CheckCircle2 },
  ];

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pesanan</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total pesanan</p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pesanan, nama..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="CONFIRMED">Dikonfirmasi</option>
            <option value="PROCESSING">Diproses</option>
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
                {['No', 'No. Pesanan', 'Customer', 'Produk', 'Total', 'Status', 'Pembayaran', 'Tanggal', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order: any, i: number) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-blue-600 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                        {order.userName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm">{order.userName}</p>
                        <p className="text-xs text-gray-400">{order.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{order.items?.length} item</td>
                  <td className="px-4 py-3 font-bold text-blue-700">{formatRupiah(order.totalAmount)}</td>
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
                  <td className="px-4 py-3 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setTrackingInput(order.trackingNumber || '');
                        setCourierInput(order.courier || 'JNE');
                      }}
                      className="p-2 rounded-xl hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Tidak ada pesanan</div>
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
                  <h2 className="text-xl font-bold text-gray-800">{selectedOrder.orderNumber}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{selectedOrder.userName} • {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto px-7 py-6 space-y-6">

              {/* SECTION: ALUR AKSI TERURUT & KONFIRMASI */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">Alur Progres Pesanan</p>
                
               {/* ======================================================= */}
{/* VISUAL STEPPER (DIWARNAI SESUAI STATUS YANG DILALUI) */}
{/* ======================================================= */}
{selectedOrder.status !== 'CANCELLED' ? (
  <div className="mb-8 px-2">
    <div className="relative flex items-center justify-between w-full">
      {/* Baris Garis Belakang */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
      
      {/* Baris Garis Progress Berwarna Aktif */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500 rounded-full"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />

      {/* Map Tiap Status Node */}
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        
        // JIKA SUDAH DILALUI: Ubah ikon menjadi CheckCircle agar user tahu itu sudah selesai
        // JIKA AKTIF/BELUM: Gunakan ikon aslinya (Clock, Settings, dll)
        const IconComponent = isCompleted ? CheckCircle2 : step.icon;

        return (
          <div key={idx} className="flex flex-col items-center flex-1 relative">
            <div 
              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white z-10
                ${isCompleted ? 'border-blue-600 bg-blue-600 text-white' : ''}
                ${isActive ? 'border-blue-600 text-blue-600 ring-4 ring-blue-100 font-bold bg-white' : ''}
                ${!isCompleted && !isActive ? 'border-gray-300 text-gray-400 bg-white' : ''}
              `}
            >
              {/* Pastikan ukuran ikon stabil */}
              <IconComponent className="w-4 h-4 shrink-0" />
            </div>
            <span 
              className={`text-[11px] font-medium mt-2 absolute -bottom-6 whitespace-nowrap tracking-tight
                ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}
                ${isCompleted ? 'text-gray-700 font-medium' : ''}
              `}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
    <div className="h-4" /> {/* Spacer bantal bawah tulisan */}
  </div>
) : (
  <div className="mb-6 bg-red-50 text-red-700 rounded-xl p-3.5 text-xs font-medium border border-red-100 flex items-center gap-2">
    <span className="text-base">❌</span> Alur progres dihentikan karena pesanan berstatus dibatalkan.
  </div>
)}
                {/* ======================================================= */}

                {/* 1. STATUS: PENDING ATAU CONFIRMED -> DIPROSES */}
{(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
  <div className="space-y-2 mt-4">
    {/* Peringatan jika belum lunas */}
    {selectedOrder.paymentStatus !== 'PAID' ? (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 text-xs font-medium">
        ⚠️ Pesanan tidak dapat diproses karena status pembayaran belum **LUNAS**. Silakan tunggu pembayaran selesai atau konfirmasi pembayaran terlebih dahulu.
      </div>
    ) : (
      <p className="text-xs text-gray-500">Langkah selanjutnya: Mengubah status pesanan menjadi sedang diproses.</p>
    )}
    
    <button
      disabled={loadingStatus !== null || selectedOrder.paymentStatus !== 'PAID'}
      onClick={() => {
        if (window.confirm('Apakah Anda yakin ingin MEMPROSES pesanan ini?')) {
          handleUpdateStatus(selectedOrder.id, 'PROCESSING');
        }
      }}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
    >
      {loadingStatus === 'PROCESSING' ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Truck className="w-4 h-4" />
      )}
      Proses Pesanan Sekarang
    </button>
  </div>
)}

                {/* 2. STATUS: PROCESSING -> INPUT RESI -> STATUS JADI DIKIRIM */}
                {selectedOrder.status === 'PROCESSING' && (
                  <div className="space-y-3 mt-4">
                    <p className="text-xs text-gray-500">Langkah selanjutnya: Silakan masukkan nomor resi kurir untuk mengirim produk.</p>
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={courierInput}
                        onChange={(e) => setCourierInput(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {['JNE', 'SiCepat', 'J&T', 'TIKI', 'POS'].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>

                      <input
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Masukkan nomor resi..."
                        className="flex-1 min-w-[200px] px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        disabled={loadingStatus === 'SHIPPED' || !trackingInput}
                        onClick={() => {
                          if (window.confirm(`Apakah Anda yakin nomor resi ${trackingInput} (${courierInput}) sudah benar? Status otomatis akan berubah menjadi DIKIRIM.`)) {
                            handleSetTracking();
                          }
                        }}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-medium transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {loadingStatus === 'SHIPPED' && <Loader2 className="w-4 h-4 animate-spin" />}
                        Simpan & Atur Dikirim
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. STATUS: SHIPPED -> SELESAI */}
{selectedOrder.status === 'SHIPPED' && (
  <div className="space-y-3 mt-4">
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700 mb-2 flex items-center justify-between">
      <div>
        <span className="font-bold">Resi Saat Ini:</span> {selectedOrder.courier} - {selectedOrder.trackingNumber}
      </div>
    </div>
    
    <p className="text-xs text-gray-500">Langkah selanjutnya: Konfirmasi jika pesanan tersebut sudah sampai dengan selamat di tangan customer.</p>
    
    <div className="flex flex-wrap gap-3">
      <button
        disabled={loadingStatus !== null}
        onClick={() => {
          if (window.confirm('Apakah Anda yakin pesanan sudah sampai? Mengonfirmasi tindakan ini akan mengubah status produk menjadi SELESAI.')) {
            handleUpdateStatus(selectedOrder.id, 'DELIVERED');
          }
        }}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
      >
        {loadingStatus === 'DELIVERED' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Konfirmasi Pesanan Selesai
      </button>

      <button
        onClick={() => {
          // Sinkronisasi input field dengan data resi saat ini sebelum form dibuka
          setTrackingInput(selectedOrder.trackingNumber || '');
          setCourierInput(selectedOrder.courier || 'JNE');
          // Kita pakai trick toggle memanfaatkan state trackingInput atau state baru
          // Namun agar ringkas tanpa tambah state boolean baru, kita cek jika form sedang terbuka/tertutup
          const formResi = document.getElementById('form-edit-resi');
          if (formResi) formResi.classList.toggle('hidden');
        }}
        className="px-4 py-2.5 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium"
      >
        Ubah No. Resi
      </button>
    </div>

    {/* FORM EDIT RESI (Tersembunyi secara default, muncul jika tombol di atas diklik) */}
    <div id="form-edit-resi" className="hidden mt-4 p-4 border border-gray-200 bg-white rounded-2xl space-y-3 transition-all">
      <p className="text-xs font-semibold text-gray-600">Form Perubahan Nomor Resi</p>
      <div className="flex flex-wrap gap-3">
        <select
          value={courierInput}
          onChange={(e) => setCourierInput(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {['JNE', 'SiCepat', 'J&T', 'TIKI', 'POS'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          value={trackingInput}
          onChange={(e) => setTrackingInput(e.target.value)}
          placeholder="Masukkan nomor resi baru..."
          className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          disabled={loadingStatus === 'SHIPPED' || !trackingInput}
          onClick={async () => {
            if (window.confirm(`Apakah Anda yakin ingin mengubah nomor resi menjadi ${trackingInput} (${courierInput})?`)) {
              await handleSetTracking();
              // Sembunyikan kembali form setelah sukses
              document.getElementById('form-edit-resi')?.classList.add('hidden');
            }
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loadingStatus === 'SHIPPED' && <Loader2 className="w-4 h-4 animate-spin" />}
          Update Resi
        </button>
      </div>
    </div>
  </div>
)}

                {/* 5. STATUS: CANCELLED */}
                {selectedOrder.status === 'CANCELLED' && (
                  <div className="text-red-600 font-medium text-sm bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                    Pesanan telah dibatalkan.
                  </div>
                )}

                {/* DARURAT: TOMBOL PEMBATALAN */}
                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      disabled={loadingStatus !== null}
                      onClick={() => {
                        if (window.confirm('PERINGATAN! Apakah Anda yakin ingin MEMBATALKAN pesanan ini? Tindakan ini bersifat permanen.')) {
                          handleUpdateStatus(selectedOrder.id, 'CANCELLED');
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      Batalkan Pesanan
                    </button>
                  </div>
                )}
              </div>

              {/* PAYMENT INFO */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Informasi Pembayaran</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Metode Pembayaran</span>
                    <span className="text-sm font-medium">{selectedOrder.paymentMethod || '-'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ITEMS */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Item Pesanan</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-3 border border-gray-100">
                      <div className={`${item.productBgColor} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl`}>
                        {item.productEmoji}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                      </div>

                      <p className="text-sm font-bold">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Alamat Pengiriman</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{selectedOrder.shippingAddress?.recipientName}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>

              {/* TOTAL */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Pembayaran</p>
                  <p className="text-xs text-blue-400 mt-1">Sudah termasuk ongkir</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">{formatRupiah(selectedOrder.totalAmount)}</p>
              </div>

            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-7 py-5 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}