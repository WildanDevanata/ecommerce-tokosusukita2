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
  Download,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';
import { formatRupiah } from '@/lib/utils';

const periods = [
  { id: 'week', label: 'Minggu Ini' },
  { id: 'month', label: 'Bulan Ini' },
  { id: 'year', label: 'Tahun Ini' },
];

const reportTabs = [
  { id: 'financial', label: '💰 Keuangan' },
  { id: 'sales', label: '📦 Penjualan' },
  { id: 'efficiency', label: '⚡ Efisiensi' },
];

export default function AdminReportsPage() {
  const { orders, products, users } = useApp();

  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('financial');

  // =========================
  // STATS
  // =========================
  const paidOrders = orders.filter(
    (o) => o.paymentStatus === 'PAID'
  );

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const avgOrderValue =
    paidOrders.length > 0
      ? totalRevenue / paidOrders.length
      : 0;

  const totalCustomers = users.filter(
    (u) => u.role === 'CUSTOMER'
  ).length;

  const deliveredOrders = orders.filter(
    (o) => o.status === 'DELIVERED'
  ).length;

  const cancelledOrders = orders.filter(
    (o) => o.status === 'CANCELLED'
  ).length;

  // =========================
  // REVENUE CHART
  // =========================
  const revenueChartData = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    return months.map((month, index) => {
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === index;
      });

      return {
        month,
        revenue: monthOrders.reduce(
          (sum, o) => sum + o.totalAmount,
          0
        ),
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  // =========================
  // PAYMENT METHODS
  // =========================
  const paymentMethodData = [
    { name: 'Transfer', value: 45, fill: '#2563EB' },
    { name: 'E-Wallet', value: 30, fill: '#16A34A' },
    { name: 'COD', value: 15, fill: '#F59E0B' },
    { name: 'QRIS', value: 10, fill: '#DC2626' },
  ];

  // =========================
  // TOP PRODUCTS
  // =========================
  const topProductsData = useMemo(() => {
    const map: Record<
      string,
      { name: string; sold: number }
    > = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!map[item.productName]) {
          map[item.productName] = {
            name: item.productName,
            sold: 0,
          };
        }

        map[item.productName].sold += item.quantity;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders]);

  // =========================
  // DELIVERY PIE
  // =========================
  const deliveryData = [
    {
      name: 'Selesai',
      value: deliveredOrders,
      fill: '#16A34A',
    },
    {
      name: 'Dibatalkan',
      value: cancelledOrders,
      fill: '#DC2626',
    },
    {
      name: 'Proses',
      value:
        orders.length -
        deliveredOrders -
        cancelledOrders,
      fill: '#2563EB',
    },
  ];

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">
            Laporan & Analitik
          </h1>

          <p className="text-gray-500 text-sm">
            Pusat data keuangan, penjualan,
            dan efisiensi
          </p>
        </div>

        <div className="flex gap-2">
          {/* PERIOD */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  period === p.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* EXPORT */}
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex border-b border-gray-100">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
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
                  {
                    label: 'Total Pendapatan',
                    value: formatRupiah(
                      totalRevenue
                    ),
                    icon: TrendingUp,
                    color:
                      'text-blue-600 bg-blue-50',
                    change: '+12.5%',
                  },
                  {
                    label:
                      'Avg. Nilai Pesanan',
                    value: formatRupiah(
                      avgOrderValue
                    ),
                    icon: ShoppingBag,
                    color:
                      'text-green-600 bg-green-50',
                    change: '+5.2%',
                  },
                  {
                    label: 'Total Pesanan',
                    value:
                      orders.length.toString(),
                    icon: Package,
                    color:
                      'text-orange-600 bg-orange-50',
                    change: '+8.1%',
                  },
                  {
                    label: 'Total Customer',
                    value:
                      totalCustomers.toString(),
                    icon: Users,
                    color:
                      'text-purple-600 bg-purple-50',
                    change: '+15%',
                  },
                ].map((kpi, i) => {
                  const Icon = kpi.icon;
                  const [color, bg] =
                    kpi.color.split(' ');

                  return (
                    <div
                      key={i}
                      className="p-4 bg-gray-50 rounded-2xl"
                    >
                      <div
                        className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}
                      >
                        <Icon
                          className={`w-4 h-4 ${color}`}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mb-1">
                        {kpi.label}
                      </p>

                      <p className="text-xl font-bold text-gray-800">
                        {kpi.value}
                      </p>

                      <p className="text-xs text-green-600 mt-1">
                        ↑ {kpi.change} vs bulan
                        lalu
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* AREA CHART */}
              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">
                  Tren Pendapatan 12 Bulan
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={240}
                >
                  <AreaChart
                    data={revenueChartData}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563EB"
                          stopOpacity={0.15}
                        />

                        <stop
                          offset="95%"
                          stopColor="#2563EB"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                    />

                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) =>
                        `${(
                          v / 1000000
                        ).toFixed(0)}Jt`
                      }
                    />

                    <Tooltip
                      formatter={(v) => [
                        formatRupiah(
                          v as number
                        ),
                        'Pendapatan',
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* PAYMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-700 mb-4 font-semibold">
                    Distribusi Metode
                    Pembayaran
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={200}
                  >
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {paymentMethodData.map(
                          (
                            entry,
                            index
                          ) => (
                            <Cell
                              key={index}
                              fill={
                                entry.fill
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        formatter={(v) => [
                          `${v}%`,
                          '',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {paymentMethodData.map(
                    (item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background:
                                item.fill,
                            }}
                          />

                          <span className="text-sm text-gray-700">
                            {item.name}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-800">
                            {item.value}%
                          </span>

                          <p className="text-xs text-gray-400">
                            {Math.round(
                              (orders.length *
                                item.value) /
                                100
                            )}{' '}
                            pesanan
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= SALES ================= */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">
                  Top 5 Produk Terlaris
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={250}
                >
                  <BarChart
                    data={topProductsData}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{
                        fontSize: 10,
                      }}
                      width={110}
                    />

                    <Tooltip
                      formatter={(v) => [
                        `${v} unit`,
                        'Terjual',
                      ]}
                    />

                    <Bar
                      dataKey="sold"
                      fill="#2563EB"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-gray-700 mb-4 font-semibold">
                  Pesanan per Bulan
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={200}
                >
                  <BarChart
                    data={revenueChartData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      formatter={(v) => [
                        `${v} pesanan`,
                        'Pesanan',
                      ]}
                    />

                    <Bar
                      dataKey="orders"
                      fill="#16A34A"
                      radius={[4, 4, 0, 0]}
                    />
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
                    label:
                      'Tingkat Penyelesaian',
                    value: `${Math.round(
                      (deliveredOrders /
                        Math.max(
                          orders.length,
                          1
                        )) *
                        100
                    )}%`,
                    desc: `${deliveredOrders} dari ${orders.length} pesanan selesai`,
                    color:
                      'text-green-600',
                    bg: 'bg-green-50',
                  },
                  {
                    label:
                      'Tingkat Pembatalan',
                    value: `${Math.round(
                      (cancelledOrders /
                        Math.max(
                          orders.length,
                          1
                        )) *
                        100
                    )}%`,
                    desc: `${cancelledOrders} pesanan dibatalkan`,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                  },
                  {
                    label:
                      'Rata-rata Proses',
                    value: '1.8 hari',
                    desc: 'Dari konfirmasi ke pengiriman',
                    color:
                      'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    className={`${kpi.bg} rounded-2xl p-5 text-center`}
                  >
                    <p
                      className={`text-4xl font-bold ${kpi.color}`}
                    >
                      {kpi.value}
                    </p>

                    <p className="font-medium text-gray-700 mt-2">
                      {kpi.label}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {kpi.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* PIE */}
                <div>
                  <h3 className="text-gray-700 mb-4 font-semibold">
                    Status Pesanan
                  </h3>

                  <ResponsiveContainer
                    width="100%"
                    height={200}
                  >
                    <PieChart>
                      <Pie
                        data={deliveryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({
                          name,
                          value,
                        }) =>
                          `${name}: ${value}`
                        }
                      >
                        {deliveryData.map(
                          (
                            entry,
                            i
                          ) => (
                            <Cell
                              key={i}
                              fill={
                                entry.fill
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* SUMMARY */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-gray-700 mb-4 font-semibold">
                    Ringkasan Operasional
                  </h3>

                  {[
                    {
                      label:
                        'Total Pesanan Masuk',
                      value: orders.length,
                    },
                    {
                      label:
                        'Pesanan Selesai',
                      value:
                        deliveredOrders,
                    },
                    {
                      label:
                        'Pesanan Dibatalkan',
                      value:
                        cancelledOrders,
                    },
                    {
                      label:
                        'Sedang Diproses',
                      value:
                        orders.filter(
                          (o) =>
                            [
                              'CONFIRMED',
                              'PROCESSING',
                              'SHIPPED',
                            ].includes(
                              o.status
                            )
                        ).length,
                    },
                    {
                      label:
                        'Menunggu Konfirmasi',
                      value:
                        orders.filter(
                          (o) =>
                            o.status ===
                            'PENDING'
                        ).length,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 border-b border-gray-200 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>

                      <span className="text-sm font-bold text-gray-800">
                        {item.value}
                      </span>
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