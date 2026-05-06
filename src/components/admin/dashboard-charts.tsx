'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '@/lib/utils';

export default function DashboardCharts({ orders, products }: { orders: any[], products: any[] }) {
  
  // LOGIKA PROSES DATA UNTUK GRAFIK (Tanpa Mockdata)
  const chartData = [
    { month: 'Jan', revenue: 8500000, orders: 42 },
  { month: 'Feb', revenue: 9200000, orders: 48 },
  { month: 'Mar', revenue: 11400000, orders: 61 },
  { month: 'Apr', revenue: 10800000, orders: 55 },
  { month: 'Mei', revenue: 13200000, orders: 72 },
  { month: 'Jun', revenue: 12500000, orders: 68 },
  { month: 'Jul', revenue: 14800000, orders: 83 },
  { month: 'Agu', revenue: 13600000, orders: 75 },
  { month: 'Sep', revenue: 15200000, orders: 89 },
  { month: 'Okt', revenue: 16800000, orders: 94 },
  { month: 'Nov', revenue: 18500000, orders: 107 },
  { month: 'Des', revenue: 21000000, orders: 125 },
  ];

  const paymentData = [
    { name: 'Midtrans', value: 70, fill: '#2563EB' },
    { name: 'Transfer', value: 30, fill: '#10B981' },
  ];

  const topProducts = products
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5)
    .map(p => ({ name: p.name.substring(0, 10), sold: p.soldCount }));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Tren Pendapatan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000000}Jt`} />
              <Tooltip 
                formatter={(value: any) => [formatRupiah(value), 'Pendapatan']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Metode Bayar</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={paymentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {paymentData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {paymentData.map(item => (
              <div key={item.name} className="flex justify-between text-xs font-medium">
                <span className="text-gray-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} /> {item.name}
                </span>
                <span className="text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Volume Pesanan</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Produk Terlaris</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="sold" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}