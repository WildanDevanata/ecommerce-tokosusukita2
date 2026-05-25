// src/utils/helpers.ts

// ==============================
// FORMAT RUPIAH
// ==============================
export const formatRupiah = (
  number: number = 0
) => {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }
  ).format(number);
};

// ==============================
// FORMAT DATE
// ==============================
export const formatDate = (
  dateString: string
) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(date);
};

// ==============================
// LABEL STATUS ORDER
// ==============================
export const getOrderStatusLabel = (
  status: string
) => {
  const labels: Record<string, string> =
    {
      PENDING: 'Menunggu',
      CONFIRMED: 'Dikonfirmasi',
      PROCESSING: 'Diproses',
      SHIPPED: 'Dikirim',
      DELIVERED: 'Selesai',
      REVIEWED: 'Diulas',
      CANCELLED: 'Dibatalkan',
    };

  return labels[status] || status;
};

// ==============================
// WARNA STATUS ORDER
// ==============================
export const getOrderStatusColor = (
  status: string
) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';

    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-700';

    case 'PROCESSING':
      return 'bg-indigo-100 text-indigo-700';

    case 'SHIPPED':
      return 'bg-purple-100 text-purple-700';

    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-700';

    case 'REVIEWED':
      return 'bg-cyan-100 text-cyan-700';

    case 'CANCELLED':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// ==============================
// LABEL STATUS PEMBAYARAN
// ==============================
export const getPaymentStatusLabel = (
  status: string
) => {
  const labels: Record<string, string> =
    {
      PENDING: 'Menunggu',
      WAITING_VERIFICATION:
        'Menunggu Verifikasi',
      PAID: 'Lunas',
      FAILED: 'Gagal',
      REFUNDED: 'Dikembalikan',
    };

  return labels[status] || status;
};

// ==============================
// WARNA STATUS PEMBAYARAN
// ==============================
export const getPaymentStatusColor = (
  status: string
) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';

    case 'WAITING_VERIFICATION':
      return 'bg-blue-100 text-blue-700';

    case 'PAID':
      return 'bg-emerald-100 text-emerald-700';

    case 'FAILED':
      return 'bg-red-100 text-red-700';

    case 'REFUNDED':
      return 'bg-gray-200 text-gray-700';

    default:
      return 'bg-gray-100 text-gray-600';
  }
};