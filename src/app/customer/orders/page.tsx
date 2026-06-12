'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, ChevronRight, Loader2, Search, X, AlertTriangle, Star, Camera, FileText } from 'lucide-react';
import Navbar from '@/components/sharing/navbar';
import { useApp } from '@/store/appcontext';
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from '@/lib/utils';

const TABS = [
  { id: 'ALL', label: 'Semua' },
  { id: 'PENDING', label: 'Belum Bayar' },
  { id: 'CONFIRMED', label: 'Dikonfirmasi' },
  { id: 'PROCESSING', label: 'Diproses' },
  { id: 'SHIPPED', label: 'Dikirim' },
  { id: 'DELIVERED', label: 'Selesai' },
  { id: 'REVIEW', label: 'Ulasan' },
  { id: 'CANCELLED', label: 'Dibatalkan' },
];

const CANCEL_REASONS = [
  "Ingin mengubah rincian pesanan",
  "Menemukan harga lebih murah",
  "Salah memilih produk",
  "Tidak ingin membeli lagi",
  "Lainnya",
];

interface ReviewItemState {
  rating: number;
  comment: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function OrdersPage() {
  const { orders, setOrders, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [activeReviewSubTab, setActiveReviewSubTab] = useState<'NOT_REVIEWED' | 'REVIEWED'>('NOT_REVIEWED');
  
  // State untuk Pencarian & Loading prosess
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // State untuk Modals Kontrol
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);
  const [reviewData, setReviewData] = useState<{ [orderItemId: string]: ReviewItemState }>({});

  // STATE UNTUK SEAMLESS FETCHING DETAIL RIWAYAT ULASAN
  const [isViewReviewModalOpen, setIsViewReviewModalOpen] = useState(false);
  const [selectedOrderForViewReview, setSelectedOrderForViewReview] = useState<any>(null);
  const [viewReviewItems, setViewReviewItems] = useState<any[]>([]);
  const [isLoadingViewReview, setIsLoadingViewReview] = useState(false);

  // Bersihkan object URLs untuk mencegah memory leak saat unmount atau reviewData berubah
  useEffect(() => {
    return () => {
      Object.values(reviewData).forEach(item => {
        if (item.imagePreview) URL.revokeObjectURL(item.imagePreview);
      });
    };
  }, [reviewData]);

  // EFFECT UNTUK OTOMATIS AMBIL DATA REVIEW KETIKA MODAL DIALURKAN
  useEffect(() => {
    const fetchOrderReviews = async (orderId: string) => {
      setIsLoadingViewReview(true);
      try {
        const response = await fetch(`/api/reviews?orderId=${orderId}`);
        const json = await response.json();

        if (json.success) {
          setViewReviewItems(json.data); 
        } else {
          console.error(json.error || "Gagal memuat ulasan");
          setViewReviewItems([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setViewReviewItems([]);
      } finally {
        setIsLoadingViewReview(false);
      }
    };

    if (isViewReviewModalOpen && selectedOrderForViewReview?.id) {
      fetchOrderReviews(selectedOrderForViewReview.id); 
    } else {
      setViewReviewItems([]);
    }
  }, [isViewReviewModalOpen, selectedOrderForViewReview]);

  // FILTER LOGIC UTAMA
  const myOrders = orders.filter((o: any) => o.userId === currentUser?.id);
  
  const filteredOrders = myOrders.filter((order: any) => {
    let matchesTab = false;
    
    if (activeTab === 'ALL') {
      matchesTab = true;
    } else if (activeTab === 'DELIVERED') {
      // Di tab 'Selesai', hanya tampilkan yang sudah DELIVERED dan BELUM diulas seluruhnya
      const isAllItemsReviewed = order.status === 'REVIEWED' || order.items?.every((item: any) => item.isReviewed || item.review) || false;
      matchesTab = order.status === 'DELIVERED' && !isAllItemsReviewed;
    } else if (activeTab === 'REVIEW') {
      matchesTab = order.status === 'DELIVERED' || order.status === 'REVIEWED';
    } else {
      matchesTab = order.status === activeTab;
    }

    if (activeTab === 'REVIEW' && matchesTab) {
      const isAllItemsReviewed = order.status === 'REVIEWED' || order.items?.every((item: any) => item.isReviewed || item.review) || false;
      matchesTab = activeReviewSubTab === 'NOT_REVIEWED' ? !isAllItemsReviewed : isAllItemsReviewed;
    }

    // Filter berdasarkan query pencarian
    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower) {
      const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchLower);
      const matchesProducts = order.items?.some((item: any) => 
        (item.productName || item.name || '').toLowerCase().includes(searchLower)
      );
      return matchesTab && (matchesOrderNumber || matchesProducts);
    }

    return matchesTab;
  });

  // HANDLERS UNTUK MODAL PEMBATALAN PESANAN
  const handleOpenCancelModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedReason(CANCEL_REASONS[0]);
    setCustomReason('');
    setIsCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrderId) return;
    const finalReason = selectedReason === 'Lainnya' ? customReason : selectedReason;
    
    try {
      setCancellingId(selectedOrderId);
      setIsCancelModalOpen(false);

      const res = await fetch(`/api/orders/${selectedOrderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `Dibatalkan oleh pelanggan: ${finalReason}` })
      });

      if (res.ok) {
        setOrders((prev: any[]) => 
          prev.map(o => o.id === selectedOrderId ? { ...o, status: 'CANCELLED', notes: `Dibatalkan oleh pelanggan: ${finalReason}` } : o)
        );
        alert('Pesanan berhasil dibatalkan.');
      } else {
        alert('Gagal membatalkan pesanan dari server.');
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem saat membatalkan pesanan.');
    } finally {
      setCancellingId(null);
      setSelectedOrderId(null);
    }
  };

  // HANDLERS UNTUK MODAL KONFIRMASI PESANAN DITERIMA
  const handleOpenDeliveredModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDeliveredModalOpen(true);
  };

  const confirmDeliveredOrder = async () => {
    const currentOrder = orders.find((o: any) => o.id === selectedOrderId);
    
    if (!currentOrder || !currentOrder.orderNumber) {
      alert("Data pesanan tidak valid.");
      return;
    }

    try {
      setDeliveringId(selectedOrderId);
      setIsDeliveredModalOpen(false);

      const res = await fetch(`/api/orders/${currentOrder.orderNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DELIVERED',
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setOrders((prev: any[]) => 
          prev.map(o => o.id === selectedOrderId ? { ...o, status: 'DELIVERED' } : o)
        );
        
        alert('Terima kasih! Pesanan diselesaikan, silakan beri ulasan terbaik Anda.');
        setActiveTab('REVIEW');
        setActiveReviewSubTab('NOT_REVIEWED');
      } else {
        alert(json.error || 'Gagal memperbarui status pesanan.');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert('Terjadi masalah koneksi internet.');
    } finally {
      setDeliveringId(null);
      setSelectedOrderId(null);
    }
  };

  // HANDLERS UNTUK LOGIKA OPERASIONAL MANAGEMENT ULASAN (REVIEW)
  const handleOpenReviewModal = (order: any) => {
    setSelectedOrderForReview(order);
    
    const initialStates: { [key: string]: ReviewItemState } = {};
    order.items?.forEach((item: any) => {
      if (!item.review && !item.isReviewed) {
        initialStates[item.id] = {
          rating: 5,
          comment: '',
          imageFile: null,
          imagePreview: null
        };
      }
    });
    setReviewData(initialStates);
    setIsReviewModalOpen(true);
  };

  const handleRatingChange = (itemId: string, rating: number) => {
    setReviewData(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], rating }
    }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setReviewData(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment }
    }));
  };

  const handleImageChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setReviewData(prev => {
      if (prev[itemId]?.imagePreview) URL.revokeObjectURL(prev[itemId].imagePreview!);
      return {
        ...prev,
        [itemId]: { ...prev[itemId], imageFile: file, imagePreview: previewUrl }
      };
    });
  };

  const handleRemoveImage = (itemId: string) => {
    setReviewData(prev => {
      if (prev[itemId]?.imagePreview) URL.revokeObjectURL(prev[itemId].imagePreview!);
      return {
        ...prev,
        [itemId]: { ...prev[itemId], imageFile: null, imagePreview: null }
      };
    });
  };

  const handleSubmitAllReviews = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedOrderForReview) return;

  try {
    setIsSubmittingReview(true);
    
    // Pastikan semua item mempertahankan status review aslinya (baik yang lama maupun yang baru dicek)
    const updatedItems = selectedOrderForReview.items.map((item: any) => ({
      ...item,
      isReviewed: item.isReviewed || !!item.review // Set basis data awal
    }));

    // 1. Loop untuk mengirim review setiap produk yang BELUM diulas
    for (const item of updatedItems) {
      // Jika sudah diulas sebelumnya, dilewati tapi status di updatedItems tetap true
      if (item.review || item.isReviewed) {
        item.isReviewed = true; 
        continue;
      }

      const currentItemReview = reviewData[item.id];
      let imageUrl = '';

      // Upload gambar jika ada
      if (currentItemReview?.imageFile) {
        const formData = new FormData();
        formData.append('file', currentItemReview.imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      // Kirim data review ke API
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItemId: item.id,
          productId: item.productId,
          userId: currentUser?.id,
          rating: currentItemReview?.rating || 5,
          comment: currentItemReview?.comment || '',
          image: imageUrl || null
        }),
      });

      if (res.ok) {
        const reviewResult = await res.json();
        item.isReviewed = true;
        item.review = reviewResult.data || true; // Simpan object review object jika API mengembalikannya
      } else {
        throw new Error(`Gagal mengirim ulasan untuk produk: ${item.productName || item.id}`);
      }
    }

    // 2. Cek mutlak apakah SEMUA item dalam pesanan ini VALID sudah diulas
    const allReviewed = updatedItems.every((item: any) => item.isReviewed === true);

    // 3. UPDATE STATUS ORDER KE DATABASE (Hanya jika seluruh item sukses diulas)
    if (allReviewed) {
      const resOrder = await fetch(`/api/orders/${selectedOrderForReview.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REVIEWED',
        }),
      });
      
      if (!resOrder.ok) {
        console.error("Gagal memperbarui status order ke REVIEWED di server");
      }
    }

    // 4. SINKRONISASI STATE LOKAL APCCONTEXT (Akurat & Real-time)
    setOrders((prev: any[]) =>
      prev.map((o) =>
        o.id === selectedOrderForReview.id
          ? {
              ...o,
              items: updatedItems,
              status: allReviewed ? 'REVIEWED' : o.status,
            }
          : o
      )
    );
    
    alert('Terima kasih! Ulasan berhasil disimpan.');
    setIsReviewModalOpen(false);
    
    // 5. Otomatis pindahkan tab active ke "Sudah Dinilai"
    if (setActiveTab) setActiveTab('REVIEW');
    if (setActiveReviewSubTab) setActiveReviewSubTab('REVIEWED');

  } catch (error: any) {
    console.error(error);
    alert(error.message || 'Gagal menyimpan ulasan');
  } finally {
    setIsSubmittingReview(false);
  }
};

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          
          {/* Breadcrumb & Title */}
          <div className="mb-6">
            <nav className="text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-blue-600">Beranda</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800">Pesanan Saya</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-800">Pesanan Saya</h1>
            <p className="text-gray-500 text-sm mt-1">Pantau status pesanan Anda secara realtime</p>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-5">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Cari nomor pesanan atau nama susu..."
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

          {/* Navigation Filter Tabs */}
          <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm mb-5">
            <div className="flex overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const count = myOrders.filter((o: any) => {
                  let matchesTab = false;
                  if (tab.id === 'ALL') {
                    matchesTab = true;
                  } else if (tab.id === 'DELIVERED') {
                    const isAllItemsReviewed = o.status === 'REVIEWED' || o.items?.every((item: any) => item.isReviewed || item.review) || false;
                    matchesTab = o.status === 'DELIVERED' && !isAllItemsReviewed;
                  } else if (tab.id === 'REVIEW') {
                    matchesTab = o.status === 'DELIVERED' || o.status === 'REVIEWED';
                  } else {
                    matchesTab = o.status === tab.id;
                  }

                  const searchLower = searchQuery.toLowerCase().trim();
                  if (!searchLower) return matchesTab;
                  
                  const matchesOrderNumber = o.orderNumber?.toLowerCase().includes(searchLower);
                  const matchesProducts = o.items?.some((item: any) => (item.productName || item.name || '').toLowerCase().includes(searchLower));
                  return matchesTab && (matchesOrderNumber || matchesProducts);
                }).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-5 py-4 text-sm font-bold border-b-2 transition-all ${
                      activeTab === tab.id
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

          {/* Sub Nav Tab Khasiat Review */}
          {activeTab === 'REVIEW' && (
            <div className="flex gap-2 mb-5 bg-white p-1.5 rounded-[20px] border border-gray-100 shadow-sm max-w-md">
              <button
                onClick={() => setActiveReviewSubTab('NOT_REVIEWED')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeReviewSubTab === 'NOT_REVIEWED'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Belum Dinilai
              </button>
              <button
                onClick={() => setActiveReviewSubTab('REVIEWED')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeReviewSubTab === 'REVIEWED'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Sudah Dinilai
              </button>
            </div>
          )}

          {/* List Content Area */}
          {filteredOrders.length === 0 ? (
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
            <div className="space-y-5">
              {filteredOrders.map((order: any) => {
                // Evaluasi status dinamis untuk tampilan badge lokal
                const isAllItemsReviewed = order.status === 'REVIEWED' || order.items?.every((item: any) => item.isReviewed || item.review) || false;
                const displayStatus = (order.status === 'DELIVERED' && isAllItemsReviewed) ? 'REVIEWED' : order.status;

                return (
                  <div key={order.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    
                    {/* Card Header Info */}
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
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getOrderStatusColor(displayStatus)}`}>
                          {getOrderStatusLabel(displayStatus)}
                        </span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Card Body Products List */}
                    <div className="px-6 py-4">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100 overflow-hidden">
                              {item.image || item.productImage || item.productImageUrl ? (
                                <img
                                  src={item.image || item.productImage || item.productImageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : '🥛'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-800 truncate">{item.productName || item.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <p className="text-sm font-black text-blue-700">{formatRupiah(item.price * item.quantity)}</p>
                            {(item.review || item.isReviewed) && (
                              <span className="text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md ml-2 font-medium">Sudah Diulas</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Pembatalan Notes Info */}
                      {order.status === 'CANCELLED' && order.notes && (
                        <div className="mt-3 bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100">
                          📌 <strong>Alasan Pembatalan:</strong> {order.notes.replace("Dibatalkan oleh pelanggan: ", "")}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-5 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pesanan</p>
                        <h3 className="text-2xl font-black text-blue-700 mt-1">{formatRupiah(order.totalAmount)}</h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleOpenCancelModal(order.id)}
                              disabled={cancellingId === order.id}
                              className="px-4 py-2 border border-red-300 text-red-500 rounded-2xl text-sm hover:bg-red-50 transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              {cancellingId === order.id ? 'Memproses...' : 'Batalkan'}
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
                            📦No.Resi = {order.trackingNumber}
                          </span>
                        )}
                        
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleOpenDeliveredModal(order.id)}
                            disabled={deliveringId === order.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            {deliveringId === order.id ? 'Memproses...' : 'Pesanan Diterima'}
                          </button>
                        )}

                        {order.status === 'DELIVERED' && activeTab === 'DELIVERED' && (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-2xl">
                            ✓ Pesanan Selesai
                          </span>
                        )}

                        {activeTab === 'REVIEW' && (
                          activeReviewSubTab === 'NOT_REVIEWED' ? (
                            <button
                              onClick={() => handleOpenReviewModal(order)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-md shadow-amber-100 transition-all flex items-center gap-1.5"
                            >
                              Substansi Review ⭐ Tulis Review
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedOrderForViewReview(order);
                                setIsViewReviewModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-2xl shadow-md shadow-blue-100 transition-all"
                            >
                              <FileText className="w-4 h-4" /> Detail Review
                            </button>
                          )
                        )}

                        <Link href={`/customer/orders/${order.id}`} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-blue-700">
                          Detail <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* SISA COMPONENT MODAL SESUAI ASLINYA DIBAWAH... */}

      {/* MODAL FORM ALASAN PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-red-50/50 p-6 pb-4 border-b border-gray-50 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">Batalkan Pesanan</h3>
                <p className="text-sm text-gray-500 mt-0.5">Beritahu kami alasan pembatalan Anda sebelum mengonfirmasi.</p>
              </div>
            </div>
          
            <div className="p-6 space-y-4">
              <label className="block text-sm font-bold text-gray-700">Pilih Alasan Utama:</label>
              <div className="space-y-2">
                {CANCEL_REASONS.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-medium' : 'border-gray-100 hover:bg-gray-50 text-gray-600'
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

              {selectedReason === "Lainnya" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Tulis Alasan Kustom:</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alasan pembatalan Anda secara detail..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-800"
                    required
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100">
                Kembali
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={selectedReason === "Lainnya" && !customReason.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-200 transition-all disabled:opacity-50"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PESANAN DITERIMA */}
      {isDeliveredModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">✅</div>
            <h3 className="text-xl font-black text-gray-800">Pesanan Selesai?</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">Apakah produk sudah Anda terima dengan baik dan sesuai pesanan?</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => { setIsDeliveredModalOpen(false); setSelectedOrderId(null); }} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm"
              >
                Belum
              </button>
              <button 
                type="button" 
                onClick={confirmDeliveredOrder} 
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200"
              >
                Ya, Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POP-UP DIALOG BERI REVIEW */}
      {isReviewModalOpen && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 my-8">
            
            {/* Header Modal */}
            <div className="bg-amber-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-800">Ulas Pesanan Anda</h3>
                <p className="text-xs text-gray-500 mt-0.5">Nomor Order: {selectedOrderForReview.orderNumber}</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAllReviews}>
              {/* Kontainer Scroll untuk review multi-produk */}
              <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {selectedOrderForReview.items?.map((item: any) => {
                  if (item.isReviewed) {
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-sm font-bold text-gray-500">🥛 {item.productName || item.name} sudah selesai Anda ulas.</span>
                      </div>
                    );
                  }

                  const itemState = reviewData[item.id] || { rating: 5, comment: '', imagePreview: null, imageFile: null };

                  return (
                    <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                      
                      {/* Info Mini Produk */}
                      <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                          {item.image || item.productImage || item.productImageUrl ? (
                            <img src={item.image || item.productImage || item.productImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '🥛'}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{item.productName || item.name}</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Berikan Rating:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingChange(item.id, star)}
                                className="text-gray-200 hover:scale-110 transition-all"
                              >
                                <Star className={`w-6 h-6 ${star <= itemState.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Komentar Ulasan:</label>
                          <textarea
                            rows={3}
                            value={itemState.comment}
                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                            placeholder="Tulis ulasan produk Anda di sini..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">
                  Batal
                </button>
                <button type="submit" disabled={isSubmittingReview} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-1">
                  {isSubmittingReview ? 'Menyimpan...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💡 MODAL BARU: DETAIL RIWAYAT REVIEW (DENGAN TEMA BLUE UTAS SEPERTI HALAMAN UTAMA KAMU) */}
      {isViewReviewModalOpen && selectedOrderForViewReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
            
            {/* Header Modal - Berwarna Biru Sesuai Tema Utama */}
            <div className="bg-blue-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-800">Riwayat Ulasan Anda</h3>
                <p className="text-xs text-gray-500 mt-0.5">Nomor Order: {selectedOrderForViewReview.orderNumber}</p>
              </div>
              <button 
                onClick={() => {
                  setIsViewReviewModalOpen(false);
                  setViewReviewItems([]);
                }}
                className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Content List Review */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
              {isLoadingViewReview ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm font-medium mt-2">Memuat ulasan dari server...</p>
                </div>
              ) : !viewReviewItems || viewReviewItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  Tidak ada ulasan ditemukan untuk pesanan ini.
                </div>
              ) : (
                viewReviewItems.map((item: any) => {
                  const activeReview = item.review ? item.review : item;
                  const productName = item.productName || item.name || "Produk";
                  const productImage = item.image || item.productImage || null;

                  return (
                    <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-4">
                      {/* Info Mini Produk */}
                      <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img src={productImage} alt="" className="w-full h-full object-cover" />
                          ) : '🥛'}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{productName}</span>
                      </div>

                      {/* Detail Hasil Ulasan */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rating:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const currentRating = Number(activeReview?.rating) || 0;
                              return (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= currentRating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Komentar:</label>
                          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700">
                            {activeReview?.comment && activeReview.comment.trim() !== "" ? (
                              <span className="italic text-gray-800">"{activeReview.comment}"</span>
                            ) : (
                              <span className="text-gray-400 italic">Tidak ada komentar tertulis.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => {
                  setIsViewReviewModalOpen(false);
                  setViewReviewItems([]);
                }} 
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-100"
              >
                Tutup Riwayat
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}