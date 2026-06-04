import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import DashboardCharts from "@/components/admin/dashboard-charts";

// Helper status UI
const getStatusStyles = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

export default async function AdminDashboardPage() {
  // 🕒 Setup Waktu Real-Time (Bulan ini vs Bulan lalu)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // 🔥 Ambil seluruh data esensial secara paralel dari Prisma
  const [orders, products, customersCount, lastMonthOrders, newCustomersThisMonth, newProductsThisMonth] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.product.findMany({
      include: { category: true },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    // Mengambil order bulan lalu untuk komparasi pendapatan & total pesanan
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    }),
    // Jumlah customer baru bulan ini
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: { gte: startOfThisMonth },
      },
    }),
    // Jumlah produk baru dimasukkan bulan ini
    prisma.product.count({
      where: {
        createdAt: { gte: startOfThisMonth },
      },
    }),
  ]);

  // 📊 1. LOGIKA STATISTIK PENDAPATAN (REAL-TIME)
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lastMonthRevenue = lastMonthOrders
    .filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Hitung persentase pertumbuhan pendapatan
  let revenueChange = "+0%";
  if (lastMonthRevenue > 0) {
    const percentage = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    revenueChange = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  } else if (totalRevenue > 0) {
    revenueChange = "+100%"; // Kondisi jika bulan lalu tidak ada penjualan sama sekali
  }

  // 📦 2. LOGIKA STATISTIK PESANAN
  const thisMonthOrdersCount = orders.filter(
    (o) => new Date(o.createdAt).getMonth() === now.getMonth() && new Date(o.createdAt).getFullYear() === now.getFullYear()
  ).length;

  let ordersChange = "+0%";
  if (lastMonthOrders.length > 0) {
    const percentage = ((orders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;
    ordersChange = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
  } else if (orders.length > 0) {
    ordersChange = "+100%";
  }

  // 🏷️ 3. LOGIKA STOK & PRODUK AKSI
  const lowStockProducts = products.filter((p) => p.stock < 30);
  const activeProducts = products.filter((p) => p.isActive).length;

  // 🍉 4. KUMPULAN UTUH DATA DYNAMIC CARDS
  const statCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      change: revenueChange,
      icon: TrendingUp,
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      desc: "Semua pembayaran berhasil",
    },
    {
      title: "Total Pesanan",
      value: orders.length.toString(),
      change: ordersChange,
      icon: ShoppingBag,
      lightColor: "bg-green-50",
      textColor: "text-green-600",
      desc: `${thisMonthOrdersCount} pesanan masuk bulan ini`,
    },
    {
      title: "Total Produk Aktif",
      value: activeProducts.toString(),
      change: `+${newProductsThisMonth} baru`,
      icon: Package,
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
      desc: `${lowStockProducts.length} produk stok menipis`,
    },
    {
      title: "Total Customer",
      value: customersCount.toString(),
      change: `+${newCustomersThisMonth} baru`,
      icon: Users,
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      desc: "Pengguna terdaftar sistem",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Real-time data terintegrasi langsung dari database toko Anda.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const isNegative = card.change.startsWith("-");
          
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 ${card.lightColor} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>

                <span 
                  className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isNegative 
                      ? "text-red-600 bg-red-50" 
                      : "text-green-600 bg-green-50"
                  }`}
                >
                  {!isNegative && <ArrowUpRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>

              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">
                {card.value}
              </p>
              <p className="text-[10px] text-gray-400 mt-15 uppercase font-semibold tracking-wider">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart (Diberikan passthrough data real-time) */}
      <DashboardCharts orders={orders} products={products} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Pesanan Terbaru</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Belum ada pesanan masuk.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
                    {order.user?.name?.[0] || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      #{order.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.user?.name || "Guest User"} • {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-blue-700">
                      {formatRupiah(order.totalAmount)}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusStyles(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">⚠️ Stok Menipis</h3>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Kelola Produk <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">Semua aman! Tidak ada stok di bawah 30 pcs.</p>
            ) : (
              lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-1">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg border border-gray-100">
                    📦
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {product.category?.name || "Tanpa Kategori"}
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    product.stock <= 5 
                      ? "bg-red-50 text-red-600" 
                      : "bg-orange-50 text-orange-600"
                  }`}>
                    {product.stock} pcs
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}