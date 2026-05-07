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
    SHIPPED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

export default async function AdminDashboardPage() {
  // 🔥 Ambil data dari database
  const [orders, products, customersCount] = await Promise.all([
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
  ]);

  // 📊 Statistik
const totalRevenue = orders
  .filter(
    (o) =>
      o.paymentStatus === "PAID" &&
      o.status !== "CANCELLED"
  )
  .reduce((sum, o) => sum + o.totalAmount, 0);

  const thisMonthOrders = orders.filter(
    (o) =>
      new Date(o.createdAt).getMonth() === new Date().getMonth()
  ).length;

  const lowStockProducts = products.filter((p) => p.stock < 30);
  const activeProducts = products.filter((p) => p.isActive).length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      title: "Total Pendapatan",
      value: formatRupiah(totalRevenue),
      change: "+12.5%",
      icon: TrendingUp,
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      desc: "Pembayaran berhasil",
    },
    {
      title: "Total Pesanan",
      value: orders.length.toString(),
      change: "+8.2%",
      icon: ShoppingBag,
      lightColor: "bg-green-50",
      textColor: "text-green-600",
      desc: `${thisMonthOrders} pesanan bulan ini`,
    },
    {
      title: "Total Produk",
      value: activeProducts.toString(),
      change: "+3 baru",
      icon: Package,
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
      desc: `${lowStockProducts.length} stok menipis`,
    },
    {
      title: "Total Customer",
      value: customersCount.toString(),
      change: "+5 baru",
      icon: Users,
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      desc: "Pengguna terdaftar",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Real-time data dari database toko Anda.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
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

                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>

              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">
                {card.value}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chart (Client Component) */}
      <DashboardCharts orders={orders} products={products} />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">
              Pesanan Terbaru
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {order.user?.name?.[0] || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">
                    #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user?.name} •{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700">
                    {formatRupiah(order.totalAmount)}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusStyles(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">
              ⚠️ Stok Menipis
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Stok Masuk <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  📦
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.category?.name || "Tanpa Kategori"}
                  </p>
                </div>

                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-orange-50 text-orange-600">
                  {product.stock} pcs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}