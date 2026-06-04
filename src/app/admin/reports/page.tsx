'use client';

import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  Filter,
  RotateCcw,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';
import { formatRupiah } from '@/lib/utils';

const reportTabs = [
  { id: 'financial', label: '💰 Keuangan' },
  { id: 'sales', label: '📦 Penjualan' },
  { id: 'efficiency', label: '⚡ Efisiensi' },
];

const monthsList = [
  { value: 'all', label: 'Semua Bulan (All-Time)' }, // Pilihan untuk All-Time
  { value: '0', label: 'Januari' },
  { value: '1', label: 'Februari' },
  { value: '2', label: 'Maret' },
  { value: '3', label: 'April' },
  { value: '4', label: 'Mei' },
  { value: '5', label: 'Juni' },
  { value: '6', label: 'Juli' },
  { value: '7', label: 'Agustus' },
  { value: '8', label: 'September' },
  { value: '9', label: 'Oktober' },
  { value: '10', label: 'November' },
  { value: '11', label: 'Desember' },
];

const yearsList = [
  { value: 'all', label: 'Semua Tahun (All-Time)' }, // Pilihan untuk All-Time
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

export default function AdminReportsPage() {
  const { orders = [], products = [], users = [] } = useApp();

  const [activeTab, setActiveTab] = useState('financial');

  // State Input Dropdown (Awalnya default April 2024 sesuai data kamu)
  const [selectedMonth, setSelectedMonth] = useState('3'); // '3' = April
  const [selectedYear, setSelectedYear] = useState('2024');

  // State Filter Aktif yang mengontrol data (Mula-mula aktif di April 2024)
  const [appliedFilters, setAppliedFilters] = useState<{ month: string; year: string } | null>({
    month: '3',
    year: '2024',
  });

  // Handler Terapkan Filter
  const handleApplyFilter = () => {
    setAppliedFilters({
      month: selectedMonth,
      year: selectedYear,
    });
  };

  // FIX: Saat di-reset, dropdown & filter diset ke 'all' supaya kalkulasi jadi All-Time!
  const handleResetFilter = () => {
    setSelectedMonth('all');
    setSelectedYear('all');
    setAppliedFilters({
      month: 'all',
      year: 'all',
    });
  };

  // =========================================================
  // LOGIKA DATA FILTER (Mendukung Akumulasi All-Time)
  // =========================================================
  const filteredOrders = useMemo(() => {
    if (!appliedFilters) return orders;

    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return false;

      // Jika filter bernilai 'all', abaikan penyaringan dan loloskan datanya
      const matchMonth = appliedFilters.month === 'all' || orderDate.getMonth() === parseInt(appliedFilters.month, 10);
      const matchYear = appliedFilters.year === 'all' || orderDate.getFullYear() === parseInt(appliedFilters.year, 10);
      
      return matchMonth && matchYear;
    });
  }, [orders, appliedFilters]);

  // =========================
  // STATS KPI
  // =========================
  const paidOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.paymentStatus === 'PAID');
  }, [filteredOrders]);

  const totalRevenue = useMemo(() => {
    return paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [paidOrders]);

  const avgOrderValue = useMemo(() => {
    return paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  }, [paidOrders, totalRevenue]);

  const totalCustomers = useMemo(() => {
    return users.filter((u) => u.role === 'CUSTOMER').length;
  }, [users]);

  const deliveredOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'DELIVERED').length;
  }, [filteredOrders]);

  const cancelledOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.status === 'CANCELLED').length;
  }, [filteredOrders]);

  // =========================================================
  // REVENUE CHART (12 Bulan Utuh Berdasarkan Tahun Aktif)
  // =========================================================
  const revenueChartData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    // Tentukan target tahun untuk grafik. 
    // Jika filter diset ke 'all', maka fallback otomatis ke tahun berjalan saat ini (2026).
    let targetYear = 2026;
    const currentFilterYear = appliedFilters?.year || selectedYear;
    
    if (currentFilterYear !== 'all') {
      targetYear = parseInt(currentFilterYear, 10);
    }

    return months.map((month, index) => {
      const monthOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        if (isNaN(d.getTime())) return false;
        
        return d.getMonth() === index && d.getFullYear() === targetYear;
      });

      return {
        month,
        revenue: monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
        orders: monthOrders.length,
      };
    });
  }, [orders, appliedFilters, selectedYear]);

  // =========================================================
  // PAYMENT METHODS (Real-time & Berubah Putih jika Kosong)
  // =========================================================
  const paymentMethodData = useMemo(() => {
    if (filteredOrders.length === 0) {
      return [{ name: 'Tidak ada data', value: 1, count: 0, fill: '#FFFFFF' }];
    }

    const config: Record<string, { label: string; fill: string }> = {
      TRANSFER: { label: 'Bank Transfer', fill: '#2563EB' },
      MIDTRANS: { label: 'Midtrans Gateway', fill: '#16A34A' },
      EWALLET: { label: 'E-Wallet', fill: '#F59E0B' },
      UNKNOWN: { label: 'Belum Memilih', fill: '#9CA3AF' }
    };

    const counts: Record<string, number> = {};
    let totalValidOrders = 0;

    filteredOrders.forEach((o) => {
      const method = o.paymentMethod || 'UNKNOWN';
      counts[method] = (counts[method] || 0) + 1;
      totalValidOrders++;
    });

    return Object.entries(counts).map(([key, count]) => {
      const percentage = Math.round((count / totalValidOrders) * 100);
      return {
        name: config[key]?.label || key,
        value: percentage,
        count: count,
        fill: config[key]?.fill || '#6B7280',
      };
    });
  }, [filteredOrders]);

  // =========================================================
  // TOP PRODUCTS (Sesuai perbaikan tipe array order.items langsung)
  // =========================================================
  const topProductsData = useMemo(() => {
    const map: Record<string, { name: string; sold: number }> = {};

    filteredOrders.forEach((order) => {
      const itemList = order.items || [];
      
      itemList.forEach((item: any) => {
        const pName = item.productName || `Produk ID: ${item.productId || 'Unknown'}`;

        if (!map[pName]) {
          map[pName] = { name: pName, sold: 0 };
        }
        map[pName].sold += (item.quantity || 0);
      });
    });

    return Object.values(map)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [filteredOrders]);

  // =========================
  // DELIVERY PIE
  // =========================
  const deliveryData = [
    { name: 'Selesai', value: deliveredOrders, fill: '#16A34A' },
    { name: 'Dibatalkan', value: cancelledOrders, fill: '#DC2626' },
    {
      name: 'Proses',
      value: Math.max(0, filteredOrders.length - deliveredOrders - cancelledOrders),
      fill: '#2563EB',
    },
  ];

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-gray-800 text-2xl font-bold">Laporan & Analitik</h1>
        <p className="text-gray-500 text-sm">Pusat data keuangan, penjualan, dan efisiensi</p>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-end gap-4 shadow-sm">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Periode Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 block">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {yearsList.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilter}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Filter className="w-4 h-4" />
            Terapkan Filter
          </button>
          
          <button
            onClick={handleResetFilter}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All-Time
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex border-b border-gray-100">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ================= FINANCIAL ================= */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Avg. Nilai Pesanan', value: formatRupiah(avgOrderValue), icon: ShoppingBag, color: 'text-green-600 bg-green-50' },
                  { label: 'Total Pesanan', value: filteredOrders.length.toString(), icon: Package, color: 'text-orange-600 bg-orange-50' },
                  { label: 'Total Customer', value: totalCustomers.toString(), icon: Users, color: 'text-purple-600 bg-purple-50' },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  const [color, bg] = kpi.color.split(' ');
                  return (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl">
                      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                      <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* AREA CHART */}
              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">
                  Tren Pendapatan Tahun {appliedFilters?.year === 'all' ? '2026 (Sekarang)' : (appliedFilters?.year || selectedYear)}
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Jt`} />
                    <Tooltip formatter={(v) => [formatRupiah(v as number), 'Pendapatan']} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* PAYMENT SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 p-2">
                  <div className="w-full text-center">
                    <h3 className="text-gray-700 mb-2 font-semibold text-left pl-2">Distribusi Metode Pembayaran</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          stroke={filteredOrders.length === 0 ? "#E5E7EB" : "#FFFFFF"}
                          strokeWidth={filteredOrders.length === 0 ? 1 : 2}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Pie>
                        {filteredOrders.length > 0 && <Tooltip formatter={(v) => [`${v}%`, 'Proporsi']} />}
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* List Keterangan dinamis */}
                <div className="space-y-3 flex flex-col justify-center">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm font-medium text-gray-400 italic">Tidak ada data transaksi pada periode ini</p>
                    </div>
                  ) : (
                    paymentMethodData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: item.fill }} />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-800">{item.value}%</span>
                          <p className="text-xs text-gray-400">{item.count} pesanan</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= SALES ================= */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">Top 5 Produk Terlaris</h3>
                {topProductsData.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed text-sm text-gray-400 italic">
                    Tidak ada produk terjual pada periode ini
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topProductsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip formatter={(v) => [`${v} unit`, 'Terjual']} />
                      <Bar dataKey="sold" fill="#2563EB" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">Pesanan per Bulan</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} pesanan`, 'Pesanan']} />
                    <Bar dataKey="orders" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ================= EFFICIENCY ================= */}
          {activeTab === 'efficiency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Tingkat Penyelesaian',
                    value: `${Math.round((deliveredOrders / Math.max(filteredOrders.length, 1)) * 100)}%`,
                    desc: `${deliveredOrders} dari ${filteredOrders.length} pesanan selesai`,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                  },
                  {
                    label: 'Tingkat Pembatalan',
                    value: `${Math.round((cancelledOrders / Math.max(filteredOrders.length, 1)) * 100)}%`,
                    desc: `${cancelledOrders} pesanan dibatalkan`,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                  },
                  {
                    label: 'Rata-rata Proses',
                    value: filteredOrders.length > 0 ? '1.8 hari' : '0 hari',
                    desc: 'Dari konfirmasi ke pengiriman',
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                ].map((kpi, i) => (
                  <div key={i} className={`${kpi.bg} rounded-2xl p-5 text-center`}>
                    <p className={`text-4xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <p className="font-medium text-gray-700 mt-2">{kpi.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{kpi.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-700 mb-4 font-semibold">Status Pesanan</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={filteredOrders.length === 0 ? [{ name: 'Empty', value: 1, fill: '#FFFFFF' }] : deliveryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={filteredOrders.length > 0 ? ({ name, value }) => `${name}: ${value}` : undefined}
                        stroke={filteredOrders.length === 0 ? "#E5E7EB" : "#FFFFFF"}
                      >
                        {(filteredOrders.length === 0 ? [{ fill: '#FFFFFF' }] : deliveryData).map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      {filteredOrders.length > 0 && <Tooltip />}
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-gray-700 mb-4 font-semibold">Ringkasan Operasional</h3>
                  {[
                    { label: 'Total Pesanan Masuk', value: filteredOrders.length },
                    { label: 'Pesanan Selesai', value: deliveredOrders },
                    { label: 'Pesanan Dibatalkan', value: cancelledOrders },
                    {
                      label: 'Sedang Diproses',
                      value: filteredOrders.filter((o) =>
                        ['CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
                      ).length,
                    },
                    {
                      label: 'Menunggu Konfirmasi',
                      value: filteredOrders.filter((o) => o.status === 'PENDING').length,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="text-sm font-bold text-gray-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}