// import { useState } from 'react';
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import { 
//   Download, 
//   TrendingUp, 
//   ShoppingBag, 
//   Users, 
//   Package,
//   ArrowUpRight,
//   ChevronRight
// } from 'lucide-react';
// import { useApp } from '@/store/appcontext';
// import { 
//   revenueChartData, 
//   paymentMethodData, 
//   topProductsData, 
//   formatRupiah, 
//   demoUsers 
// } from '../../../data/mockData';

// const periods = [
//   { id: 'week', label: 'Minggu Ini' },
//   { id: 'month', label: 'Bulan Ini' },
//   { id: 'year', label: 'Tahun Ini' },
// ];

// const reportTabs = [
//   { id: 'financial', label: '💰 Keuangan' },
//   { id: 'sales', label: '📦 Penjualan' },
//   { id: 'efficiency', label: '⚡ Efisiensi' },
// ];

// export default function AdminReportsPage() {
//   const { orders } = useApp();
//   const [period, setPeriod] = useState('month');
//   const [activeTab, setActiveTab] = useState('financial');

//   // Logic data processing
//   const totalRevenue = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.totalAmount, 0);
//   const avgOrderValue = orders.length > 0 ? totalRevenue / orders.filter(o => o.paymentStatus === 'PAID').length : 0;
//   const totalCustomers = demoUsers.filter(u => u.role === 'CUSTOMER').length;
//   const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
//   const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

//   const deliveryData = [
//     { name: 'Selesai', value: deliveredOrders, fill: '#10B981' },
//     { name: 'Dibatalkan', value: cancelledOrders, fill: '#EF4444' },
//     { name: 'Proses', value: orders.length - deliveredOrders - cancelledOrders, fill: '#3B82F6' },
//   ];

//   return (
//     <div className="space-y-6 pb-10">
//       {/* HEADER SECTION */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan & Analitik</h1>
//           <p className="text-gray-500 text-sm">Monitor performa bisnis toko dalam satu dasbor.</p>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <div className="flex p-1 bg-gray-100 rounded-2xl border border-gray-200">
//             {periods.map(p => (
//               <button 
//                 key={p.id} 
//                 onClick={() => setPeriod(p.id)} 
//                 className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
//                   period === p.id 
//                   ? 'bg-white text-blue-600 shadow-sm' 
//                   : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {p.label}
//               </button>
//             ))}
//           </div>
//           <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
//             <Download className="w-4 h-4" /> Export
//           </button>
//         </div>
//       </div>

//       {/* TAB NAVIGATION */}
//       <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-3xl w-fit shadow-sm">
//         {reportTabs.map(tab => (
//           <button 
//             key={tab.id} 
//             onClick={() => setActiveTab(tab.id)} 
//             className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all ${
//               activeTab === tab.id 
//               ? 'bg-blue-50 text-blue-600' 
//               : 'text-gray-400 hover:bg-gray-50'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* MAIN CONTENT AREA */}
//       <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
//         <div className="p-8">
          
//           {/* TAB: FINANCIAL */}
//           {activeTab === 'financial' && (
//             <div className="space-y-10">
//               {/* KPI CARDS */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {[
//                   { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12.5%' },
//                   { label: 'Avg. Nilai Pesanan', value: formatRupiah(avgOrderValue), icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+5.2%' },
//                   { label: 'Total Pesanan', value: orders.length.toString(), icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', change: '+8.1%' },
//                   { label: 'Total Customer', value: totalCustomers.toString(), icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+15%' },
//                 ].map((kpi, i) => (
//                   <div key={i} className="p-6 bg-gray-50/50 border border-gray-100 rounded-[24px] hover:bg-white hover:shadow-md transition-all group">
//                     <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
//                       <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
//                     </div>
//                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
//                     <p className="text-2xl font-black text-gray-900">{kpi.value}</p>
//                     <div className="flex items-center gap-1 mt-2">
//                       <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{kpi.change}</span>
//                       <span className="text-[10px] text-gray-400 font-medium">vs bulan lalu</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* REVENUE CHART */}
//               <div className="p-6 border border-gray-100 rounded-[28px]">
//                 <div className="flex justify-between items-center mb-6">
//                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
//                     <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
//                     Tren Pendapatan Bulanan
//                   </h3>
//                   <button className="text-xs font-bold text-blue-600 hover:underline">Lihat Detail</button>
//                 </div>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <AreaChart data={revenueChartData}>
//                     <defs>
//                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
//                         <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
//                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `${(v / 1000000).toFixed(0)}Jt`} />
//                     <Tooltip 
//                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
//                       formatter={v => [formatRupiah(v as number), 'Pendapatan']} 
//                     />
//                     <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fill="url(#colorRevenue)" />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           )}

//           {/* TAB: SALES */}
//           {activeTab === 'sales' && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="p-6 border border-gray-100 rounded-[28px]">
//                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
//                   <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
//                   Produk Terlaris
//                 </h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
//                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
//                     <XAxis type="number" hide />
//                     <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
//                     <Tooltip cursor={{fill: '#f8fafc'}} />
//                     <Bar dataKey="sold" fill="#3B82F6" radius={[0, 10, 10, 0]} barSize={20} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="p-6 border border-gray-100 rounded-[28px]">
//                 <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
//                   <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
//                   Volume Pesanan
//                 </h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={revenueChartData}>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
//                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
//                     <Tooltip />
//                     <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           )}

//           {/* TAB: EFFICIENCY */}
//           {activeTab === 'efficiency' && (
//             <div className="space-y-8">
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//                 {[
//                   { label: 'Selesai Tepat Waktu', value: `${Math.round(deliveredOrders / Math.max(orders.length, 1) * 100)}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
//                   { label: 'Tingkat Pembatalan', value: `${Math.round(cancelledOrders / Math.max(orders.length, 1) * 100)}%`, color: 'text-rose-600', bg: 'bg-rose-50' },
//                   { label: 'Waktu Pengiriman', value: '1.8 Hari', color: 'text-blue-600', bg: 'bg-blue-50' },
//                 ].map((item, i) => (
//                   <div key={i} className={`${item.bg} rounded-[24px] p-8 text-center border border-white shadow-inner`}>
//                     <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
//                     <p className="font-bold text-gray-700 mt-2 uppercase text-xs tracking-widest">{item.label}</p>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="p-6 border border-gray-100 rounded-[28px] flex flex-col items-center">
//                   <h3 className="font-bold text-gray-800 mb-6 w-full text-left italic font-serif">Status Delivery</h3>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <PieChart>
//                       <Pie 
//                         data={deliveryData} 
//                         innerRadius={60} 
//                         outerRadius={100} 
//                         paddingAngle={8} 
//                         dataKey="value"
//                       >
//                         {deliveryData.map((entry, i) => <Cell key={i} fill={entry.fill} cornerRadius={10} />)}
//                       </Pie>
//                       <Tooltip />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="flex gap-4 mt-4">
//                     {deliveryData.map(d => (
//                       <div key={d.name} className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.fill}} />
//                         <span className="text-xs font-bold text-gray-600">{d.name}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="bg-gray-50/50 p-8 rounded-[28px] border border-gray-100">
//                   <h3 className="font-bold text-gray-800 mb-6">Ringkasan Operasional</h3>
//                   <div className="space-y-4">
//                     {[
//                       { label: 'Total Pesanan Masuk', value: orders.length, color: 'bg-blue-500' },
//                       { label: 'Selesai', value: deliveredOrders, color: 'bg-emerald-500' },
//                       { label: 'Dibatalkan', value: cancelledOrders, color: 'bg-rose-500' },
//                       { label: 'Dalam Proses', value: orders.length - deliveredOrders - cancelledOrders, color: 'bg-orange-500' },
//                     ].map((item, i) => (
//                       <div key={i} className="flex items-center justify-between group cursor-default">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-2 h-2 rounded-full ${item.color}`} />
//                           <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
//                         </div>
//                         <span className="text-sm font-black text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-100">{item.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }