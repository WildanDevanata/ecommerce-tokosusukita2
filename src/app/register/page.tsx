'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '@/store/appcontext';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';   

export default function RegisterPage() {
  const { loginGoogle } = useApp() || {};
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // 1. TAMBAHKAN STATE ERROR UNTUK MENAMPILKAN PESAN GAGAL DARI DATABASE
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert('Password tidak cocok');
    
    try {
      setLoading(true);
      setError(''); // Reset error setiap kali submit

      // 2. TEMBAK API BACKEND REGISTER YANG ASLI
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      // 3. JIKA DATABASE MENOLAK (Misal email/no hp sudah terdaftar)
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal mendaftarkan akun');
        setLoading(false);
        return;
      }

      // 4. JIKA SUKSES MASUK DATABASE
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push('/login'), 2000);

    } catch (err: any) {
      console.error('❌ Error Register:', err);
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center border border-gray-100 shadow-2xl shadow-gray-200/50 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-100">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">Pendaftaran Berhasil!</h2>
        <p className="text-gray-400 text-xs font-medium mt-1.5 leading-relaxed">
          Akun pangkalan Anda telah terdaftar. Mengalihkan ke halaman login secara otomatis...
        </p>
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex">
        
        {/* SISI KIRI: BANNER DEKORATIF BRANDING */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white font-black text-sm tracking-tight border border-white/10">
              🍼 Toko Susu Kita
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              Penuhi Nutrisi Tumbuh Kembang Si Kecil Bersama Kami
            </h2>
            <p className="text-blue-100/80 text-sm font-medium mt-3 leading-relaxed">
              Daftarkan pangkalan belanja Anda sekarang untuk mendapatkan akses stok susu terlengkap, harga grosir terbaik, dan pelacakan pengiriman instan.
            </p>
          </div>

          <div className="relative z-10 text-xs font-medium text-blue-200/60">
            © {new Date().getFullYear()} TokoSusuKita. All rights reserved.
          </div>
        </div>

        {/* SISI KANAN: FORM REGISTER UTAMA */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50/40">
          <div className="w-full max-w-md space-y-6">
            
            <div className="text-center lg:text-left">
              <div className="lg:hidden inline-flex w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center text-white text-2xl shadow-xl shadow-blue-100 mb-4">
                🍼
              </div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">Buat Akun Baru</h1>
              <p className="text-gray-400 text-xs font-semibold mt-1">Daftar dan mulai kelola kebutuhan belanja produk susu terbaik</p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/40 p-6 sm:p-8 space-y-5">
              
              {/* Opsi Login Google */}
              <button
                type="button"
                onClick={() => {
                  if (loginGoogle) {
                    loginGoogle();
                    setTimeout(() => router.push('/dashboard/customer/profile'), 500);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] transition-all text-xs font-bold text-gray-600"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Daftar Instan via Google
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-gray-100" />
                <span className="absolute px-3 bg-white text-[10px] font-black text-gray-300 uppercase tracking-wider">atau via email</span>
              </div>

              {/* Form Input Data */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap pangkalan/anda"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">No. Handphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="081234567890"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 karakter keamanan"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="confirm"
                      type={showPass ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="Ulangi kata sandi di atas"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Checkbox Ketentuan */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1 group">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-all cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-400 font-medium leading-relaxed group-hover:text-gray-500 transition-colors">
                    Saya setuju dengan <span className="text-blue-600 font-bold hover:underline">Syarat Layanan</span> dan <span className="text-blue-600 font-bold hover:underline">Kebijakan Privasi</span> toko.
                  </span>
                </label>

                {/* 5. SELEPAN ALERT COMPONENT UNTUK MENAMPILKAN ERROR JIKA GAGAL */}
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs font-semibold text-red-600 animate-in fade-in duration-200">
                    ⚠️ {error}
                  </div>
                )}

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-md shadow-blue-100 tracking-wide transition-all active:scale-[0.99] disabled:bg-gray-200 disabled:shadow-none disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Akun Baru...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Form */}
              <p className="text-center text-xs font-bold text-gray-400 pt-2">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-black">
                  Masuk di Sini
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}