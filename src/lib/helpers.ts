// src/utils/helpers.ts

export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "Menunggu",
    CONFIRMED: "Dikonfirmasi",
    PROCESSING: "Diproses",
    SHIPPED: "Dikirim",
    DELIVERED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return labels[status] || status;
};

export const getOrderStatusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-amber-100 text-amber-600";
    case "CONFIRMED": return "bg-blue-100 text-blue-600";
    case "PROCESSING": return "bg-indigo-100 text-indigo-600";
    case "SHIPPED": return "bg-purple-100 text-purple-600";
    case "DELIVERED": return "bg-emerald-100 text-emerald-600";
    case "CANCELLED": return "bg-red-100 text-red-600";
    default: return "bg-gray-100 text-gray-600";
  }
};

export const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    UNPAID: "Belum Bayar",
    PAID: "Lunas",
    REFUNDED: "Dikembalikan",
  };
  return labels[status] || status;
};

export const getPaymentStatusColor = (status: string) => {
  return status === "PAID" 
    ? "bg-emerald-100 text-emerald-600" 
    : "bg-red-100 text-red-600";
};