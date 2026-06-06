'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Upload, CheckCircle2, Truck, Calendar,
  MapPin, CreditCard, AlertTriangle, Loader2, Image as ImageIcon, Send, ExternalLink
} from 'lucide-react';
import { useApp } from '@/store/appcontext';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';
import Script from 'next/script';

const statusTimeline = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const CANCEL_REASONS = [
  "Ingin mengubah alamat pengiriman",
  "Salah memilih varian produk / jumlah unit",
  "Menemukan harga yang lebih murah di toko lain",
  "Metode pembayaran tidak tersedia / terlalu rumit",
  "Lainnya (Tulis alasan Anda sendiri)"
];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { orders, uploadPaymentProof, cancelOrder, bankAccounts } = useApp();

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [order, setOrder] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingMidtrans, setLoadingMidtrans] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const foundInContext = orders.find(o => o.id === id);

    if (foundInContext) {
      setOrder(foundInContext);
      loadingFetch && setLoadingFetch(false);
    } else if (id) {
      setLoadingFetch(true);
      fetch(`/api/orders/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Gagal memuat');
          return res.json();
        })
        .then((data) => {
          if (data) setOrder(data);
        })
        .catch((err) => console.error("Fallback fetch error:", err))
        .finally(() => setLoadingFetch(false));
    }
  }, [id, orders]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700' },
      PROCESSING: { label: 'Diproses', color: 'bg-purple-100 text-purple-700' },
      SHIPPED: { label: 'Dikirim', color: 'bg-indigo-100 text-indigo-700' },
      DELIVERED: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const handleMidtransPayment = async () => {
    if (!order) return;
    try {
      setLoadingMidtrans(true);
      
      const res = await fetch(`/api/payments/midtrans/token`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }) 
      });
      
      if (!res.ok) throw new Error("Gagal mendapatkan token pembayaran");
      
      const data = await res.json();
      
      if (window && (window as any).snap) {
        (window as any).snap.pay(data.snapToken, {
          onSuccess: async function(result: any){
            alert("Pembayaran berhasil!");
            try {
              const updateRes = await fetch(`/api/orders/${order.id}/confirm-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });

              if (updateRes.ok) {
                setOrder((prev: any) => prev ? { 
                  ...prev, 
                  status: 'CONFIRMED',
                  paymentStatus: 'PAID', 
                  updatedAt: new Date().toISOString()
                } : null);
              }
            } catch (err) {
              console.error("Gagal memperbarui status order di DB:", err);
            }
            router.refresh(); 
          },
          onPending: function(result: any){
            alert("Menunggu pembayaran Anda.");
            router.refresh();
          },
          onError: function(result: any){
            alert("Pembayaran gagal, silakan coba lagi.");
          },
          onClose: function(){
            alert('Anda menutup pop-up sebelum menyelesaikan pembayaran.');
          }
        });
      } else {
        alert("Midtrans SDK gagal dimuat. Silakan refresh halaman.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal memproses pembayaran Midtrans");
    } finally {
      setLoadingMidtrans(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwjuyd3xj";
    const PRESET_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "ml_default";

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', PRESET_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Gagal upload ke Cloudinary");
      return data.secure_url;
    } catch (error: any) {
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadPayment = async () => {
    if (!selectedFile || !order) {
      alert("Silakan pilih file bukti transfer terlebih dahulu.");
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(selectedFile);
      await uploadPaymentProof(order.id, imageUrl, order.paymentMethod || 'BANK TRANSFER');

      alert("Bukti pembayaran berhasil dikirim!");
      setShowUpload(false);
      setSelectedFile(null);
      setPreviewUrl(null);

      setOrder((prev: any) => prev ? { ...prev, paymentProofUrl: imageUrl } : null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const confirmCancelOrder = async () => {
    const finalReason = selectedReason.startsWith("Lainnya") ? customReason : selectedReason;

    if (selectedReason.startsWith("Lainnya") && !customReason.trim()) {
      alert("Silakan isi teks alasan kustom terlebih dahulu.");
      return;
    }

    try {
      setIsCancelling(true);
      await (cancelOrder as any)(order.id, finalReason);

      alert("Pesanan Anda berhasil dibatalkan.");
      setIsCancelModalOpen(false);

      setOrder((prev: any) => prev ? {
        ...prev,
        status: 'CANCELLED',
        cancelReason: finalReason,
        updatedAt: new Date().toISOString()
      } : null);
    } catch (error: any) {
      alert(error.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isHydrated || loadingFetch) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-sm text-gray-500 font-medium">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-800 font-bold">Pesanan tidak ditemukan</p>
          <p className="text-xs text-gray-500 max-w-xs mt-1">ID pesanan salah atau belum sinkron.</p>
          <Link href="/customer/orders" className="text-blue-600 hover:underline mt-4 inline-block text-sm font-medium">
            Kembali ke Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const statusIndex = statusTimeline.indexOf(order.status);
  const activeBanks = bankAccounts?.filter(b => b.isActive && b.type === 'BANK') || [];
  const isMidtrans = order.paymentMethod?.toUpperCase().includes('MIDTRANS');

  return (
  <>
    <Script 
      src="https://app.sandbox.midtrans.com/snap/snap.js" 
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
    />
    <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <p className="text-gray-500 text-sm font-mono">{order.orderNumber}</p>
              {/* 🆕 1. TAMBAH TANGGAL ORDER DI BAWAH ORDER NUMBER */}
              {order.createdAt && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="text-gray-300">•</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* Status Tracker */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-6">Status Pesanan</h3>
              {order.status === 'CANCELLED' ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-2xl">❌</span>
                  <div>
                    <p className="font-bold text-red-700">Pesanan Dibatalkan</p>
                    <p className="text-xs text-red-500">Waktu: {new Date(order.updatedAt).toLocaleString('id-ID')}</p>
                    {order.cancelReason && (
                      <p className="text-xs text-red-600 mt-1 italic font-medium">Alasan: "{order.cancelReason}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between relative px-2">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 mx-10">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${Math.max(0, (statusIndex / (statusTimeline.length - 1)) * 100)}%` }}
                    />
                  </div>
                  {statusTimeline.map((status, idx) => {
                    const passed = idx <= statusIndex;
                    const emojis: Record<string, string> = { PENDING: '📋', CONFIRMED: '✅', PROCESSING: '⚙️', SHIPPED: '🚚', DELIVERED: '📦' };
                    const labels: Record<string, string> = { PENDING: 'Menunggu', CONFIRMED: 'Konfirmasi', PROCESSING: 'Proses', SHIPPED: 'Kirim', DELIVERED: 'Selesai' };

                    return (
                      <div key={status} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${passed ? 'bg-blue-600 shadow-lg shadow-blue-100 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                          {passed ? <span>{emojis[status]}</span> : <span className="text-xs font-bold">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] sm:text-xs mt-2 text-center font-medium ${passed ? 'text-blue-600' : 'text-gray-400'}`}>
                          {labels[status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 🆕 2. MODIFIKASI AREA RESI: Tambah Layanan Courier, Service & Estimasi ETD */}
              {order.courier && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Informasi Pengiriman</p>
                      <p className="text-sm font-bold text-indigo-900 mt-0.5">
                        {order.courier} {order.shippingService ? ` - Kurir ${order.shippingService}` : ''}
                      </p>
                      {order.trackingNumber ? (
                        <p className="text-xs text-gray-500 font-mono mt-0.5">No. Resi: {order.trackingNumber}</p>
                      ) : (
                        <p className="text-xs text-amber-600 mt-0.5 font-medium">Resi belum diinput oleh Admin</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Estimasi Pengiriman (ETD) */}
                  {order.shippingEtd && (
                    <div className="border-t sm:border-t-0 sm:border-l border-indigo-200/60 pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Estimasi Tiba</p>
                      <p className="text-sm font-black text-indigo-900 bg-white/80 border border-indigo-100 rounded-lg px-2.5 py-1 mt-0.5 inline-block sm:block">
                        ⏱️ {order.shippingEtd}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
              
              {/* Section Bukti Pembayaran */}
            {(order.status !== 'PENDING' && order.status !== 'CANCELLED') && order.paymentProofUrl && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Bukti Pembayaran</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <Image
                      src={order.paymentProofUrl}
                      alt="Bukti Transfer"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold text-green-600">Pembayaran Terverifikasi</p>
                    <p className="text-xs text-gray-500 mt-1">Bukti telah terkirim dan akan diverifikasi oleh admin.</p>
                    <a href={order.paymentProofUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-flex items-center gap-1">
                      Lihat Foto <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">Selesaikan Pembayaran</h3>
                </div>

                {!isMidtrans && (
                  <div className="space-y-3 mb-6">
                    {activeBanks.map(bank => (
                      <div key={bank.id} className="bg-white rounded-xl p-4 flex items-center gap-4 border border-amber-100">
                        <div className={`w-12 h-12 ${bank.color || 'bg-blue-600'} rounded-xl flex items-center justify-center text-white font-black`}>
                          {bank.bankName.substring(0, 3)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">{bank.bankName}</p>
                          <p className="text-base font-bold text-gray-800 tracking-wide">{bank.accountNumber}</p>
                          <p className="text-xs text-gray-400">a.n. {bank.accountName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-2xl p-5 text-center border border-amber-100 shadow-inner mb-5">
                  <p className="text-xs text-gray-500 mb-1">Total yang harus dibayar:</p>
                  <p className="text-3xl font-black text-blue-700">{formatCurrency(order.totalAmount)}</p>
                </div>

                {isMidtrans ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleMidtransPayment}
                      disabled={loadingMidtrans}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loadingMidtrans ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses Midtrans...</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          <span>Bayar Sekarang via Midtrans</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-center text-gray-500">Anda akan diarahkan ke gerbang pembayaran aman Midtrans.</p>
                  </div>
                ) : (
                  !order.paymentProofUrl ? (
                    <div className="space-y-3">
                      <input
                        type="file"
                        id="payment-file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />

                      <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3.5 rounded-xl font-bold hover:bg-amber-600 transition-all active:scale-[0.98]"
                      >
                        <Upload className="w-4 h-4" />
                        {showUpload ? 'Sembunyikan Menu Upload' : 'Upload Bukti Transfer'}
                      </button>

                      {showUpload && (
                        <div className="mt-3 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center bg-white shadow-sm space-y-4">
                          {previewUrl ? (
                            <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 shadow-inner">
                              <Image
                                src={previewUrl}
                                alt="Preview Bukti Transfer"
                                width={300}
                                height={250}
                                unoptimized
                                className="w-full h-auto max-h-64 object-contain rounded-lg"
                              />
                              <p className="text-xs text-gray-500 mt-2 font-medium truncate px-2">
                                📄 {selectedFile?.name}
                              </p>
                            </div>
                          ) : (
                            <div className="py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 max-w-xs mx-auto flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="w-10 h-10 stroke-1 mb-2" />
                              <p className="text-xs font-medium">Belum ada foto yang dipilih</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                            <button
                              onClick={() => document.getElementById('payment-file')?.click()}
                              disabled={uploading}
                              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {previewUrl ? '🔄 Ganti Foto' : '📂 Pilih Foto'}
                            </button>

                            {previewUrl && (
                              <button
                                onClick={handleUploadPayment}
                                disabled={uploading}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                              >
                                {uploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mengirim...</span>
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    <span>Kirim Bukti</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-green-100 rounded-xl text-green-800 border border-green-200">
                      <CheckCircle2 className="w-6 h-6" />
                      <p className="text-sm font-bold">Bukti sudah diupload. Menunggu verifikasi admin.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Rincian Produk</h3>
              <div className="divide-y divide-gray-50">
                {(order.items || []).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <div className={`${item.productBgColor || 'bg-gray-100'} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white overflow-hidden relative`}>
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                        {item.image && item.image.length > 5 ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <span className="text-2xl">{item.productEmoji || '🥛'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm leading-tight mb-1">{item.productName}</p>
                      <p className="text-xs text-gray-500 font-medium">{item.quantity} Unit x {formatCurrency(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-gray-800 font-semibold">Alamat Pengiriman</h3>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-gray-900">
                  {order.shippingRecipient || order.shippingAddress?.recipientName || 'Nama Penerima'}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingPhone || order.shippingAddress?.phone || '-'}
                </p>

                <div className="pt-2 border-t border-gray-50 mt-2">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {typeof order.shippingAddress === 'string'
                      ? order.shippingAddress
                      : order.shippingAddress?.address || 'Alamat tidak ditemukan'}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    {[
                      order.shippingCity || order.shippingAddress?.city,
                      order.shippingProvince || order.shippingAddress?.province,
                      order.shippingPostalCode || order.shippingAddress?.postalCode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Ringkasan</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.totalAmount - (order.shippingCost || 0))}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Ongkir</span>
                  <span className="text-green-600">{order.shippingCost === 0 ? 'GRATIS' : formatCurrency(order.shippingCost || 0)}</span>
                </div>
                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-gray-800">Total Belanja</span>
                    <span className="text-xl font-black text-blue-600">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-400 uppercase">Status Order</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${getStatusInfo(order.status).color}`}>
                    {getStatusInfo(order.status).label}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-400 uppercase">Pembayaran</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus || 'PENDING'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs font-bold text-gray-400 uppercase">Metode</span>
                  <span className="text-xs font-bold text-gray-700">{order.paymentMethod || 'BANK TRANSFER'}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-3 border-2 border-red-100 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-50 transition-colors"
                  >
                    Batalkan Pesanan
                  </button>
                )}
                <Link
                  href="/customer/orders"
                  className="w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold text-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                >
                  Kembali ke Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DIALOG POP-UP FORM ALASAN PEMBATALAN */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100">
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

              {selectedReason.startsWith("Lainnya") && (
                <div className="space-y-1.5 animate-slideDown">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Tulis Alasan Kustom:</label>
                  <textarea
                    rows={3}
                    placeholder="Masukkan alasan pembatalan Anda secara detail di sini..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    <Footer />
  </>
  );
}