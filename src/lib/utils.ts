// src/lib/utils.ts

export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

// Tambahkan ini untuk memperbaiki error di halaman payments:
export const formatDateTime = (date: Date | string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Tambahkan ini di src/lib/utils.ts

export const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'WAITING_VERIFICATION': return 'Menunggu Verifikasi';
    case 'PAID': return 'Terbayar';
    case 'FAILED': return 'Gagal';
    case 'REFUNDED': return 'Dikembalikan';
    default: return 'Pending';
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'WAITING_VERIFICATION': return 'bg-orange-100 text-orange-600';
    case 'PAID': return 'bg-green-100 text-green-600';
    case 'FAILED': return 'bg-red-100 text-red-600';
    case 'REFUNDED': return 'bg-gray-100 text-gray-600';
    default: return 'bg-blue-100 text-blue-600';
  }
};

// ================= ORDER STATUS =================

export function getOrderStatusLabel(status: string) {
  switch (status) {
    case 'PENDING': return 'Belum Bayar';
    case 'CONFIRMED': return 'Dikonfirmasi';
    case 'PROCESSING': return 'Diproses';
    case 'SHIPPED': return 'Dikirim';
    case 'DELIVERED': return 'Selesai (Diterima)';
    
    // ✅ TAMBAHKAN DI SINI AGAR ADMIN TAHU PESANAN SUDAH DIULAS
    case 'REVIEWED': 
      return 'Reviewed'; // Atau 'Sudah Dinilai' / 'Selesai (Diulas)'
      
    case 'CANCELLED': return 'Dibatalkan';
    default: return status; // Fallback langsung ke string aslinya jika tidak cocok
  }
}

export function getOrderStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
    case 'PROCESSING': return 'bg-indigo-100 text-indigo-700';
    case 'SHIPPED': return 'bg-purple-100 text-purple-700';
    case 'DELIVERED': return 'bg-green-100 text-green-700';
    
    // ✅ BERI WARNA KHUSUS UNTUK ADMIN (Misal: Hijau Emerald atau Biru Teal)
    case 'REVIEWED': 
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}