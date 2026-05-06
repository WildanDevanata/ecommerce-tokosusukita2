'use client'; // Wajib untuk menggunakan hooks di Next.js App Router

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useApp } from '@/store/appcontext'; // Sesuaikan path alias kamu

export default function LoginPage() {
  const { login, loginGoogle, isLoggedIn, currentUser } = useApp();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (isLoggedIn) {
      const targetPath = currentUser?.role === 'ADMIN' 
        ? '/admin/dashboard/' 
        : '/admin/customer/profile';
      router.push(targetPath);
    }
  }, [isLoggedIn, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulasi delay
    await new Promise(r => setTimeout(r, 800));
    
    const result = login(email, password);
    if (result.success) {
      const isAdmin = email === 'admin@tokosusukita.com';
      router.push(isAdmin ? '/dashboard/admin' : '/dashboard/customer/profile');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogle = () => {
    loginGoogle();
    // Gunakan timeout jika perlu sinkronisasi state global
    setTimeout(() => router.push('/dashboard/customer/profile'), 100);
  };

  const quickLogin = (type: 'admin' | 'customer') => {
    if (type === 'admin') {
      setEmail('admin@tokosusukita.com');
      setPassword('admin123');
    } else {
      setEmail('budi@email.com');
      setPassword('customer123');
    }
  };

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center group">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform">
              🍼
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Selamat Datang!</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk ke akun Anda untuk mulai belanja</p>
        </div>

        <div className="bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100/50 backdrop-blur-sm">
          {/* Demo Quick Login */}
          <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-3">Akses Cepat (Demo):</p>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => quickLogin('admin')} 
                className="flex-1 py-2.5 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-sm shadow-blue-200"
              >
                🔑 Admin
              </button>
              <button 
                type="button"
                onClick={() => quickLogin('customer')} 
                className="flex-1 py-2.5 text-xs bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-sm shadow-emerald-200"
              >
                👤 Customer
              </button>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-blue-200 transition-all mb-6 text-sm font-semibold text-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Masuk dengan Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="px-4 bg-white text-[11px] font-medium text-gray-400 uppercase tracking-widest">atau</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 font-medium animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Ingat saya</span>
              </label>
              <button type="button" className="text-xs text-blue-600 font-semibold hover:text-blue-700">Lupa password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 shadow-xl shadow-blue-100 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : 'Masuk ke Akun'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline decoration-2 underline-offset-4">
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}