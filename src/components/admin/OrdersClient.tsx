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
  MessageSquare,
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
  | 'REVIEWED'
  | 'CANCELLED';

export default function OrdersClient({
  orders: initialOrders,
}: {
  orders: any[];
}) {
  const router = useRouter();

  // 🛠️ Helper Fungsi: Validasi apakah data review benar-benar berisi ulasan valid
  const validateAndFormatStatus = (order: any): any => {
    if (!order) return order;

    const hasValidReview = order.items?.some((item: any) => {
      if (!item.review) return false;
      // Jika review bertipe Array, pastikan tidak kosong
      if (Array.isArray(item.review)) return item.review.length > 0;
      // Jika bertipe Object, pastikan memiliki properti id atau key bernilai
      return !!item.review.id || Object.keys(item.review).length > 0;
    });

    if (hasValidReview) {
      return { ...order, status: 'REVIEWED' as OrderStatus };
    }
    return order;
  };

  // Mempersiapkan data awal yang sudah disanitasi
  const sanitizedOrders = (initialOrders || []).map((order) => validateAndFormatStatus(order));

  const [orders, setOrders] = useState(sanitizedOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('JNE');
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null); 
  const [showEditResi, setShowEditResi] = useState(false);
  
  const filtered = orders.filter((o: any) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.userName && o.userName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;

    return matchSearch && matchStatus;
  });

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
      case 'REVIEWED':
        return 4;
      default:
        return -1;
    }
  };

const handleOpenModal = async (order: any) => {
  setLoadingDetail(order.id);
  try {
    const res = await fetch(`/api/orders/${order.orderNumber}`);
    if (!res.ok) throw new Error('Gagal memuat detail pesanan');
    
    const fullOrderData = await res.json();
    
    // Kita buat variabel yang menggabungkan data order dengan data pembayaran
    const formattedData = {
      ...fullOrderData,
      // Mengambil metode dari relasi payments index ke-0
      derivedMethod: fullOrderData.payments?.[0]?.method || 'TRANSFER',
      derivedProof: fullOrderData.payments?.[0]?.paymentProof || fullOrderData.paymentProofUrl || null,
    };
    
    setSelectedOrder(formattedData);
  } catch (error) {
    console.error(error);
  } finally {
    setLoadingDetail(null);
  }
};
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setLoadingStatus(status);
    try {
      const res = await fetch(`/api/orders/${selectedOrder?.orderNumber || orderId}`, {
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
            ? { ...o, status, ...(status === 'DELIVERED' || status === 'REVIEWED' ? { paymentStatus: 'PAID' } : {}) } 
            : o
        )
      );

      setSelectedOrder((prev: any) =>
        prev && prev.id === orderId 
          ? { ...prev, status, ...(status === 'DELIVERED' || status === 'REVIEWED' ? { paymentStatus: 'PAID' } : {}) } 
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
      const res = await fetch(
        `/api/orders/${selectedOrder.orderNumber}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackingNumber: trackingInput,
            courier: selectedOrder.courier,
            status: 'SHIPPED',
          }),
        }
      );

      if (!res.ok) {
        alert('Gagal menyimpan nomor resi');
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                trackingNumber: trackingInput,
                courier: selectedOrder.courier,
                status: 'SHIPPED',
              }
            : o
        )
      );

      setSelectedOrder((prev: any) =>
        prev
          ? {
              ...prev,
              trackingNumber: trackingInput,
              courier: selectedOrder.courier,
              status: 'SHIPPED',
            }
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

  const steps = [
    { label: 'Dikonfirmasi', icon: Clock },
    { label: 'Diproses', icon: Settings },
    { label: 'Dikirim', icon: Package },
    { label: 'Selesai', icon: CheckCircle2 },
    { label: 'Diulas', icon: MessageSquare },
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
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="CONFIRMED">Dikonfirmasi</option>
            <option value="PROCESSING">Diproses</option>
            <option value="SHIPPED">Dikirim</option>
            <option value="DELIVERED">Selesai</option>
            <option value="REVIEWED">Diulas</option>
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
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order: any, i: number) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold text-sm">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold uppercase shrink-0">
                        {order.userName?.[0] || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{order.userName || 'Guest'}</p>
                        <p className="text-xs text-gray-400">{order.userEmail || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{order.items?.length || 0} item</td>
                  <td className="px-4 py-3 font-bold text-gray-900 text-sm">{formatRupiah(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      disabled={loadingDetail === order.id}
                      onClick={() => handleOpenModal(order)}
                      className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loadingDetail === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Tidak ada pesanan ditemukan</div>
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
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-800">{selectedOrder.orderNumber}</h2>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{selectedOrder.userName} • {formatDate(selectedOrder.createdAt)}</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto px-7 py-6 space-y-6">

              {/* SECTION: STEPPER PROGRESS */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">Alur Progres Pesanan</p>
                
                {selectedOrder.status !== 'CANCELLED' ? (
                  <div className="mb-8 px-2">
                    <div className="relative flex items-center justify-between w-full">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
                      
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500 rounded-full"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                      />

                      {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;
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
                    <div className="h-4" />
                  </div>
                ) : (
                  <div className="mb-2 bg-red-50 text-red-700 rounded-xl p-3.5 text-xs font-medium border border-red-100 flex items-center gap-2">
                    <span>❌</span> Alur progres dihentikan karena pesanan berstatus dibatalkan.
                  </div>
                )}

                {/* STEP ACTION TRIGGERS */}
                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                  <div className="space-y-2 mt-4">
                    {selectedOrder.paymentStatus !== 'PAID' ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 text-xs font-medium">
                        ⚠️ Pesanan tidak dapat diproses karena status pembayaran belum **LUNAS**. Silakan tunggu konfirmasi pembayaran midtrans/manual.
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Langkah selanjutnya: Mengubah status pesanan menjadi sedang diproses pabrik/toko.</p>
                    )}
                    
                    <button
                      disabled={loadingStatus !== null || selectedOrder.paymentStatus !== 'PAID'}
                      onClick={() => {
                        if (window.confirm('Apakah Anda yakin ingin MEMPROSES pesanan ini?')) {
                          handleUpdateStatus(selectedOrder.id, 'PROCESSING');
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
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

                {selectedOrder.status === 'PROCESSING' && (
                  <div className="space-y-4 mt-4">
                    {/* INFO PENGIRIMAN */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-blue-700 mb-4">Informasi Pengiriman</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Ekspedisi</p>
                          <p className="font-bold text-gray-800 uppercase">{selectedOrder.courier || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Service</p>
                          <p className="font-bold text-gray-800">{selectedOrder.shippingService || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Estimasi Pengiriman</p>
                          <p className="font-bold text-gray-800">{selectedOrder.shippingEtd || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Ongkir</p>
                          <p className="font-bold text-gray-800">{formatRupiah(selectedOrder.shippingCost || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* INPUT RESI */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Input Nomor Resi</p>
                        <p className="text-xs text-gray-500 mt-1">Gunakan nomor resi sesuai ekspedisi customer.</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 min-w-[120px] flex items-center justify-center">
                          <span className="font-bold text-gray-700 uppercase text-sm">{selectedOrder.courier || '-'}</span>
                        </div>
                        <input
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          placeholder="Masukkan nomor resi..."
                          className="flex-1 min-w-[220px] px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          disabled={loadingStatus === 'SHIPPED' || !trackingInput}
                          onClick={() => {
                            if (window.confirm(`Apakah nomor resi ${trackingInput} sudah benar?`)) {
                              handleSetTracking();
                            }
                          }}
                          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-medium transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {loadingStatus === 'SHIPPED' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                          Kirim & Simpan Resi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'SHIPPED' && (
                  <div className="space-y-4 mt-4">
                    {/* INFO PENGIRIMAN */}
                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-purple-700 mb-4">Informasi Pengiriman</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Ekspedisi</p>
                          <p className="font-bold text-purple-700 uppercase">{selectedOrder.courier || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Service</p>
                          <p className="font-bold text-gray-800">{selectedOrder.shippingService || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Estimasi Pengiriman</p>
                          <p className="font-bold text-gray-800">{selectedOrder.shippingEtd || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Ongkir</p>
                          <p className="font-bold text-gray-800">{formatRupiah(selectedOrder.shippingCost || 0)}</p>
                        </div>
                      </div>

                      <div className="mt-4 bg-white rounded-xl p-3 border border-purple-100">
                        <p className="text-xs text-gray-500 mb-1">Nomor Resi</p>
                        <p className="text-sm font-bold text-purple-700 break-all">{selectedOrder.trackingNumber || '-'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={loadingStatus !== null}
                        onClick={() => {
                          if (window.confirm('Apakah Anda yakin barang sudah sampai?')) {
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
                        type="button"
                        onClick={() => {
                          setTrackingInput(selectedOrder.trackingNumber || '');
                          setShowEditResi(!showEditResi);
                        }}
                        className="px-4 py-2.5 border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
                      >
                        {showEditResi ? 'Tutup Edit Resi' : 'Ubah No. Resi'}
                      </button>
                    </div>

                    {showEditResi && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Edit Nomor Resi</p>
                          <p className="text-xs text-gray-500 mt-1">Perbarui nomor resi pengiriman customer.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <div className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 min-w-[120px] flex items-center justify-center">
                            <span className="font-bold text-gray-700 uppercase text-sm">{selectedOrder.courier || '-'}</span>
                          </div>
                          <input
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Masukkan nomor resi baru..."
                            className="flex-1 min-w-[220px] px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            disabled={loadingStatus === 'SHIPPED'}
                            onClick={async () => {
                              if (!trackingInput.trim()) {
                                alert('Nomor resi tidak boleh kosong');
                                return;
                              }
                              if (window.confirm(`Apakah nomor resi ${trackingInput} sudah benar?`)) {
                                await handleSetTracking();
                                setSelectedOrder((prev: any) => ({
                                  ...prev,
                                  trackingNumber: trackingInput,
                                }));
                                setShowEditResi(false);
                              }
                            }}
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-medium transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {loadingStatus === 'SHIPPED' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                            Simpan Resi Baru
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                  <div className="space-y-2 mt-4">
                    <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 text-xs font-medium">
                      Menunggu customer memberikan review produk.
                    </div>
                  </div>
                )}

                {selectedOrder.status === 'REVIEWED' && (
                  <div className="text-blue-700 font-medium text-xs bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 mt-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Customer pembeli telah melampirkan ulasan produk mereka.
                  </div>
                )}

                {/* EMERGENCIES: CANCEL ACTION BUTTON */}
                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'REVIEWED' && selectedOrder.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      disabled={loadingStatus !== null}
                      onClick={() => {
                        if (window.confirm('PERINGATAN! Batalkan pesanan ini secara permanen?')) {
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
<div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
  <p className="text-sm font-semibold text-gray-700 mb-4">Informasi Pembayaran</p>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Metode Pembayaran</span>
      {/* Menggunakan data yang sudah kita petakan tadi */}
      <span className="text-sm font-semibold text-gray-800 uppercase">
        {selectedOrder.derivedMethod || 'TRANSFER'}
      </span>
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-500">Status Pembayaran</span>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
        {getPaymentStatusLabel(selectedOrder.paymentStatus)}
      </span>
    </div>

    {/* Jika ada gambar, tampilkan di sini */}
    {selectedOrder.paymentProof && (
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Bukti Transfer:</p>
        <img 
          src={selectedOrder.paymentProof} 
          alt="Bukti" 
          className="w-full h-32 object-cover rounded-xl border"
        />
      </div>
    )}
  </div>
</div>

              {/* LIST ITEMS & REVIEWS */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">Item Pesanan</p>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <div className={`${item.productBgColor || 'bg-gray-50'} w-14 h-14 rounded-2xl flex items-center justify-center p-1 shrink-0 border border-gray-100`}>
                            <img src={item.image} alt={item.productName} className="w-12 h-12 object-contain rounded-md" />
                          </div>
                        ) : (
                          <div className={`${item.productBgColor || 'bg-gray-100'} w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0`}>
                            {item.productEmoji || '🍼'}
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.quantity} x {formatRupiah(item.price)}</p>
                        </div>

                        <p className="text-sm font-bold text-gray-900">{formatRupiah(item.price * item.quantity)}</p>
                      </div>

                      {/* AREA MONITOR ULASAN CUSTOMER */}
                      {item.review && (Array.isArray(item.review) ? item.review.length > 0 : (!!item.review.id || Object.keys(item.review).length > 0)) ? (
                        <div className="pt-3 border-t border-dashed border-gray-200 bg-amber-50/40 p-3 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center text-amber-600 text-xs font-bold gap-1 bg-amber-100/80 px-2 py-0.5 rounded-md">
                              ⭐ {Array.isArray(item.review) ? item.review[0]?.rating : (item.review.rating || 5)} / 5
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">Ulasan masuk</span>
                          </div>
                          <p className="text-xs text-gray-700 font-medium italic mt-1.5">
                            "{Array.isArray(item.review) ? item.review[0]?.comment : (item.review.comment || 'Ulasan tanpa deskripsi tertulis.')}"
                          </p>
                          
                          {(Array.isArray(item.review) ? item.review[0]?.image : item.review.image) && (
                            <div className="mt-2.5">
                              <img 
                                src={Array.isArray(item.review) ? item.review[0]?.image : item.review.image} 
                                alt="Gambar Ulasan User" 
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        (selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'REVIEWED') && (
                          <div className="text-[11px] text-gray-400 italic pt-2 border-t border-gray-100/60 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300" /> Belum ada ulasan untuk produk susu/barang ini.
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-4">Alamat Pengiriman</p>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-gray-800">{selectedOrder.shippingAddress?.recipientName}</p>
                  <p className="text-xs font-medium text-gray-500">{selectedOrder.shippingAddress?.phone}</p>
                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province} {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>

              {/* TOTAL BILL */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-700 font-bold">Total Nilai Pembayaran</p>
                  <p className="text-xs text-blue-400 mt-0.5">Sudah akumulasi dengan tarif ongkir</p>
                </div>
                <p className="text-2xl font-black text-blue-700">{formatRupiah(selectedOrder.totalAmount)}</p>
              </div>

            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 px-7 py-5 flex justify-end bg-white">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Tutup Tampilan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}