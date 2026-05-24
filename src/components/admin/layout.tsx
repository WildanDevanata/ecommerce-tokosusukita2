'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Grid3X3, CreditCard, Building2,
  BarChart3, Users, Bell, LogOut, Menu, X, ChevronRight, User
} from 'lucide-react';
import { useApp } from '@/store/appcontext'; 
import { formatDate } from '@/lib/utils'; 

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Pesanan', path: '/admin/orders' },
  { icon: ShoppingBag, label: 'Produk', path: '/admin/products' },
  { icon: Grid3X3, label: 'Kategori', path: '/admin/categories' },
  { icon: CreditCard, label: 'Pembayaran', path: '/admin/payments' },
  { icon: Building2, label: 'Rekening Bank', path: '/admin/bank-accounts' },
  { icon: BarChart3, label: 'Laporan', path: '/admin/reports' },
  { icon: Users, label: 'Users', path: '/admin/users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 🛠️ Bersih dari nilai fallback manual karena TypeScript sudah mengenali tipenya sekarang
  const { 
    currentUser, 
    logout, 
    notifications, 
    unreadCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useApp();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard/admin') return pathname === '/dashboard/admin';
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 flex flex-col shadow-lg ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">🍼</div>
            <div>
              <span className="text-blue-700 font-bold text-sm leading-tight block">Toko Susu Kita 2</span>
              <span className="text-gray-400 text-[10px] uppercase font-bold tracking-tighter">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase px-4 mb-4 tracking-widest">Menu Utama</p>
          <div className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  {item.label === 'Pembayaran' && unreadCount > 0 && !active && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {currentUser?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{currentUser?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              {menuItems.find(m => isActive(m.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserDropOpen(false); }}
                className={`relative p-2.5 rounded-xl transition-all ${notifOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                      <span className="font-bold text-sm text-gray-800">Notifikasi</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter">
                          Tandai Semua Dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="text-3xl mb-2">🔔</div>
                          <p className="text-xs text-gray-400">Tidak ada notifikasi baru</p>
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div
                            key={notif.id}
                            onClick={() => { 
                              markNotificationRead(notif.id); 
                              setNotifOpen(false); 
                              if (notif.link) router.push(notif.link); 
                            }}
                            className={`px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex items-start gap-4">
                              <span className="text-xl flex-shrink-0 bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-50">
                                {notif.type === 'ORDER' ? '📦' : notif.type === 'PAYMENT' ? '💳' : '🔔'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${!notif.isRead ? 'font-bold text-gray-800' : 'text-gray-500'}`}>{notif.title}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                <p className="text-[10px] text-gray-300 font-medium mt-1.5 uppercase tracking-tighter">{formatDate(notif.createdAt)}</p>
                              </div>
                              {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setUserDropOpen(!userDropOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-100">
                  {currentUser?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${userDropOpen ? 'rotate-90' : ''}`} />
              </button>

              {userDropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserDropOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-[20px] shadow-2xl border border-gray-100 z-20 py-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-800">{currentUser?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <Link href="/admin/profile" onClick={() => setUserDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <User className="w-4 h-4" /> Profil Admin
                    </Link>
                    <div className="h-px bg-gray-50 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" /> Keluar Sistem
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}