'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Tambahkan untuk sinkronisasi server component jika diperlukan
import { CheckCircle2, XCircle, Eye, Search, X, Loader2 } from 'lucide-react';
import { useApp } from '@/store/appcontext'; 
import { formatRupiah, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/utils';

interface EnrichedPayment {
  id: string;
  orderId: string;
  orderNumber: string;
  userName: string;
  method: 'TRANSFER' | 'MIDTRANS' | 'COD' | 'EWALLET';
  status: 'PENDING' | 'WAITING_VERIFICATION' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
  paymentProof?: string;
  createdAt: string;
  userEmail: string;
}

const tabs = [
  { id: 'ALL', label: 'Semua' },
  { id: 'WAITING_VERIFICATION', label: '⏳ Menunggu Verifikasi' },
  { id: 'PAID', label: '✅ Terverifikasi' },
  { id: 'PENDING', label: '🕐 Belum Bayar' },
  { id: 'REFUNDED', label: '↩️ Dikembalikan' },
];

const methodLabels: Record<string, string> = { 
  TRANSFER: '🏦 Transfer', 
  MIDTRANS: '💳 Midtrans', 
  EWALLET: '📱 E-Wallet' 
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { orders, updateOrderPaymentStatus, updateOrderStatus } = useApp();
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<EnrichedPayment | null>(null);
  
  // State global loading untuk mencegah klik ganda saat hit API
  const [isMutating, setIsMutating] = useState(false);

  const enrichedPayments: EnrichedPayment[] = orders.map(order => ({
    id: `pay-${order.id}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    userName: order.userName || order.shippingRecipient || 'Guest',
    userEmail: (order as any).userEmail || (order as any).email || '-',
    method: (order.paymentMethod as any) || 'TRANSFER',
    status: (order.paymentStatus as any) || 'PENDING',
    amount: order.totalAmount,
    paymentProof: order.paymentProofUrl,
    createdAt: typeof order.createdAt === 'string' ? order.createdAt : new Date(order.createdAt).toISOString(),
  }));

  const filtered = enrichedPayments.filter(p => {
    const matchTab = activeTab === 'ALL' || p.status === activeTab;
    const matchSearch = 
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
      p.userName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // =======================================================
  // HANDLER: VERIFIKASI PEMBAYARAN (SIMPAN KE DATABASE & CONTEXT)
  // =======================================================
  const handleVerify = async (payment: EnrichedPayment) => {
    if (!confirm(`Verifikasi pembayaran untuk pesanan #${payment.orderNumber}?`)) return;
    
    setIsMutating(true);
    try {
      // 1. Kirim perubahan ke database via API internal Next.js Anda
      const res = await fetch(`/api/orders/${payment.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          status: 'CONFIRMED' // Ubah status order menjadi CONFIRMED agar gudang bisa proses
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui data di database');
      }

      // 2. Jika API sukses, sinkronkan ke global state Context agar UI terupdate instan
      updateOrderPaymentStatus(payment.orderId, 'PAID');
      updateOrderStatus(payment.orderId, 'CONFIRMED');
      
      setSelectedPayment(null);
      router.refresh(); // Refresh route data cache jika menggunakan server component parent
    } catch (error) {
      console.error(error);
      alert('Gagal memverifikasi pembayaran. Periksa koneksi atau API database Anda.');
    } finally {
      setIsMutating(false);
    }
  };

  // =======================================================
  // HANDLER: TOLAK PEMBAYARAN (SIMPAN KE DATABASE & CONTEXT)
  // =======================================================
  const handleReject = async (payment: EnrichedPayment) => {
    if (!confirm(`Tolak pembayaran untuk pesanan #${payment.orderNumber}?`)) return;
    
    setIsMutating(true);
    try {
      // 1. Kirim perubahan status pembayaran gagal ke database
      const res = await fetch(`/api/orders/${payment.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'FAILED'
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal memperbarui data di database');
      }

      // 2. Sinkronkan ke global state Context
      updateOrderPaymentStatus(payment.orderId, 'FAILED');
      
      setSelectedPayment(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Gagal menolak pembayaran. Periksa koneksi atau API database Anda.');
    } finally {
      setIsMutating(false);
    }
  };

  const waitingCount = enrichedPayments.filter(p => p.status === 'WAITING_VERIFICATION').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pembayaran</h1>
        <p className="text-gray-500 text-sm">{enrichedPayments.length} transaksi dari database</p>
      </div>

      {/* Alert Notifikasi */}
      {waitingCount > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center gap-4 animate-in slide-in-from-top duration-500">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="font-bold text-orange-800">{waitingCount} Pembayaran Butuh Verifikasi</p>
            <p className="text-sm text-orange-700">Periksa bukti transfer dan pastikan dana sudah masuk ke rekening.</p>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto bg-gray-50/50 border-b border-gray-100 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              disabled={isMutating}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              } disabled:opacity-50`}
            >
              {tab.label}
              {tab.id === 'WAITING_VERIFICATION' && waitingCount > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {waitingCount}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari ID pesanan atau pelanggan..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-gray-50 text-left">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">No. Pesanan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Metode</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(pay => (
                <tr key={pay.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">#{pay.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-700">{pay.userName}</p>
                      <p className="text-xs text-gray-400">{pay.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-gray-800">{formatRupiah(pay.amount)}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg uppercase">
                      {methodLabels[pay.method] || pay.method}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${getPaymentStatusColor(pay.status)}`}>
                      {getPaymentStatusLabel(pay.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {pay.createdAt && !isNaN(Date.parse(pay.createdAt)) 
                          ? new Date(pay.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Tanggal tidak valid'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {pay.createdAt && !isNaN(Date.parse(pay.createdAt)) 
                          ? `${new Date(pay.createdAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB`
                          : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {pay.status === 'WAITING_VERIFICATION' && (
                        <>
                          <button 
                            disabled={isMutating} 
                            onClick={() => handleVerify(pay)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={isMutating} 
                            onClick={() => handleReject(pay)} 
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setSelectedPayment(pay)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center">
              <span className="text-4xl mb-3">🔎</span>
              <p className="text-sm font-medium">Tidak ada data pembayaran ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail & Bukti Transfer */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-gray-50">
              <h3 className="text-xl font-black text-gray-800">Detail Transaksi</h3>
              <button disabled={isMutating} onClick={() => setSelectedPayment(null)} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-blue-50/50 rounded-[24px] p-6 text-center">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Total Dana</p>
                <p className="text-3xl font-black text-blue-600">{formatRupiah(selectedPayment.amount)}</p>
                <p className="text-sm font-medium text-blue-400 mt-2">ID Pesanan: {selectedPayment.orderNumber}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bukti Pembayaran</label>
                {selectedPayment.paymentProof ? (
                  <div className="rounded-[24px] overflow-hidden border-2 border-gray-50 shadow-inner group relative">
                    <img src={selectedPayment.paymentProof} alt="Bukti transfer" className="w-full object-contain max-h-72" />
                  </div>
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-100">
                    <p className="text-xs font-bold text-gray-400 italic">User belum mengunggah bukti transfer</p>
                  </div>
                )}
              </div>

              {selectedPayment.status === 'WAITING_VERIFICATION' && (
                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={isMutating} 
                    onClick={() => handleReject(selectedPayment)} 
                    className="flex-1 bg-red-50 text-red-500 py-4 rounded-[20px] font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tolak'}
                  </button>
                  <button 
                    disabled={isMutating} 
                    onClick={() => handleVerify(selectedPayment)} 
                    className="flex-1 bg-blue-600 text-white py-4 rounded-[20px] font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verifikasi'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}