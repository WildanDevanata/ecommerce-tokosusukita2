'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatRupiah } from '@/lib/utils';

export default function DashboardCharts({ orders = [], products = [] }: { orders: any[], products: any[] }) {
  
  // =========================================================
  // 📈 1. LOGIKA PROSES TREN PENDAPATAN & VOLUME ORDER (Per Bulan - Tahun Berjalan)
  // =========================================================
  const chartData = useMemo(() => {
    const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentYear = new Date().getFullYear();

    return monthsNames.map((month, index) => {
      // Ambil order yang sukses (PAID) dan berada di bulan & tahun ini
      const monthOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === index && orderDate.getFullYear() === currentYear;
      });

      const revenue = monthOrders
        .filter((o) => o.paymentStatus === 'PAID' && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      return {
        month,
        revenue,
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  // =========================================================
  // 🍕 2. LOGIKA DISTRIBUSI METODE PEMBAYARAN RIIL
  // =========================================================
  const paymentData = useMemo(() => {
    if (orders.length === 0) {
      return [{ name: 'Tidak Ada Data', value: 100, fill: '#E5E7EB' }];
    }

    // Pemetaan warna estetik untuk enum DB kamu
    const config: Record<string, { label: string; fill: string }> = {
      TRANSFER: { label: 'Bank Transfer', fill: '#10B981' }, // Hijau
      MIDTRANS: { label: 'Midtrans Gateway', fill: '#2563EB' }, // Biru
      EWALLET: { label: 'E-Wallet', fill: '#F59E0B' }, // Orange
      UNKNOWN: { label: 'Lainnya', fill: '#9CA3AF' },
    };

    const counts: Record<string, number> = {};
    let totalValidOrders = 0;

    orders.forEach((o) => {
      const method = o.paymentMethod || 'UNKNOWN';
      counts[method] = (counts[method] || 0) + 1;
      totalValidOrders++;
    });

    return Object.entries(counts).map(([key, count]) => {
      const percentage = totalValidOrders > 0 ? Math.round((count / totalValidOrders) * 100) : 0;
      return {
        name: config[key]?.label || key,
        value: percentage,
        fill: config[key]?.fill || '#6B7280',
      };
    });
  }, [orders]);

  // =========================================================
  // 🏆 3. LOGIKA PRODUK TERLARIS (Ekstraksi Array Riil items)
  // =========================================================
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; sold: number }> = {};

    orders.forEach((order) => {
      // Ambil array items langsung dari relasi order (bukan orderItems / .create)
      const itemList = order.items || [];
      
      itemList.forEach((item: any) => {
        const pName = item.productName || `Produk ID: ${item.productId || 'Unknown'}`;
        if (!map[pName]) {
          map[pName] = { name: pName.substring(0, 12), sold: 0 };
        }
        map[pName].sold += (item.quantity || 0);
      });
    });

    // Urutkan dari yang paling banyak terjual dan ambil top 5
    return Object.values(map)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [orders]);

  return (
    <>
      {/* SECTION TREN & METODE BAYAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart Tren Pendapatan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Tren Pendapatan ({new Date().getFullYear()})</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}Jt`} />
              <Tooltip 
                formatter={(value: any) => [formatRupiah(value), 'Pendapatan']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart Metode Pembayaran */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Metode Bayar</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={paymentData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={2}>
                  {paymentData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Proporsi']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4">
            {paymentData.map(item => (
              <div key={item.name} className="flex justify-between text-xs font-semibold p-1.5 bg-gray-50 rounded-lg">
                <span className="text-gray-500 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} /> {item.name}
                </span>
                <span className="text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION VOLUME PESANAN & TOP PRODUK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Volume Pesanan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Volume Pesanan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(v) => [`${v} Pesanan`, 'Total']} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart Horizontal Produk Terlaris */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Produk Terlaris (Kuantitas)</h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-14 text-sm text-gray-400 italic">Belum ada item terjual</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 11, fill: '#4B5563' }} />
                <Tooltip formatter={(v) => [`${v} unit`, 'Terjual']} />
                <Bar dataKey="sold" fill="#10B981" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}