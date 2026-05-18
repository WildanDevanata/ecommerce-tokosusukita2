'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Upload, CheckCircle2, Truck, 
  MapPin, CreditCard, AlertTriangle, Loader2, Image as ImageIcon, Send
} from 'lucide-react';
import { useApp } from '@/store/appcontext';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

const statusTimeline = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const { orders, uploadPaymentProof, cancelOrder, bankAccounts } = useApp();
  
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // --- STATE BARU UNTUK SELEKSI & PREVIEW FILE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // State untuk mengelola data order yang siap tampil (gabungan Context & Fallback API)
  const [order, setOrder] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // 1. Sinkronisasi Hydration & Data Fetching Fallback
  useEffect(() => {
    setIsHydrated(true);

    const foundInContext = orders.find(o => o.id === id);

    if (foundInContext) {
      setOrder(foundInContext);
      setLoadingFetch(false);
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

  // Cleanup object URL preview untuk menghindari memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(val);
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

  // --- LOGIKA UPLOAD ---
  const uploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = "dwjuyd3xj"; 
    const PRESET_NAME = "ml_default"; 

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', PRESET_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.message.includes("Unknown API key")) {
          throw new Error(`Cloudinary tidak mengenali preset "${PRESET_NAME}". Pastikan preset ini sudah dibuat sebagai 'Unsigned' di Settings > Upload.`);
        }
        throw new Error(data.error?.message || "Gagal upload ke Cloudinary");
      }

      return data.secure_url;
    } catch (error: any) {
      throw error;
    }
  };

  // 1. Fungsi saat user memilih file (Hanya taruh di state & buat preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Bikin link preview temporer dari lokal browser
    if (previewUrl) URL.revokeObjectURL(previewUrl); // reset preview lama jika ada
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 2. Fungsi terpisah saat tombol "Kirim Bukti Pembayaran" diklik oleh user
  const handleUploadPayment = async () => {
    if (!selectedFile || !order) {
      alert("Silakan pilih file bukti transfer terlebih dahulu.");
      return;
    }

    try {
      setUploading(true);
      // Proses upload ke Cloudinary baru berjalan di sini
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

  // Layar loading awal
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
          <p className="text-xs text-gray-500 max-w-xs mt-1">ID pesanan salah atau rute pendaftaran database belum sinkron.</p>
          <Link href="/customer/orders" className="text-blue-600 hover:underline mt-4 inline-block text-sm font-medium">
            Kembali ke Pesanan
          </Link>
        </div>
      </div>
    );
  }

  const statusIndex = statusTimeline.indexOf(order.status);
  const activeBanks = bankAccounts?.filter(b => b.isActive && b.type === 'BANK') || [];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pesanan</h1>
            <p className="text-gray-500 text-sm font-mono">{order.orderNumber}</p>
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

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-xl flex items-center gap-4 border border-indigo-100">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                      <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Nomor Resi</p>
                    <p className="text-sm font-bold text-indigo-900">{order.trackingNumber} ({order.courier})</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Instructions */}
            {order.status === 'PENDING' && order.paymentStatus === 'PENDING' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold">Selesaikan Pembayaran</h3>
                </div>
                
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

                <div className="bg-white rounded-2xl p-5 text-center border border-amber-100 shadow-inner">
                  <p className="text-xs text-gray-500 mb-1">Total yang harus dibayar:</p>
                  <p className="text-3xl font-black text-blue-700">{formatCurrency(order.totalAmount)}</p>
                </div>

                {/* ================= SECTION UPLOAD DENGAN PREVIEW & PISAH BUTTON ================= */}
                {!order.paymentProofUrl ? (
                  <div className="mt-5 space-y-3">
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
                      <div className="mt-3 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center bg-white shadow-sm animate-in fade-in zoom-in duration-300 space-y-4">
                        
                        {/* Box Preview Gambar */}
                        {previewUrl ? (
                          <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2 shadow-inner">
                            <img 
                              src={previewUrl} 
                              alt="Preview Bukti Transfer" 
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
                          {/* Tombol 1: Pilih / Ganti File */}
                          <button 
                            onClick={() => document.getElementById('payment-file')?.click()} 
                            disabled={uploading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {previewUrl ? '🔄 Ganti Foto' : '📂 Pilih Foto'}
                          </button>

                          {/* Tombol 2: Kirim ke Cloudinary (Hanya aktif jika file sudah dipilih) */}
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
                  <div className="mt-5 flex items-center gap-3 p-4 bg-green-100 rounded-xl text-green-800 border border-green-200">
                    <CheckCircle2 className="w-6 h-6" />
                    <p className="text-sm font-bold">Bukti sudah diupload. Menunggu verifikasi admin.</p>
                  </div>
                )}
                {/* =============================================================================== */}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Rincian Produk</h3>
              <div className="divide-y divide-gray-50">
                  {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                      <div className={`${item.productBgColor || 'bg-gray-100'} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-white overflow-hidden relative`}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.productName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{item.productEmoji || '🥛'}</span>
                        )}
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
                  <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${getStatusInfo(order.status).color}`}>
                    {getStatusInfo(order.status).label}
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
                          onClick={() => { if(confirm('Batalkan pesanan ini?')) cancelOrder(order.id) }} 
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
      <Footer />
    </>
  );
}