'use client';

import {
  useState,
  useEffect,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
} from 'lucide-react';

import {
  useApp,
} from '@/store/appcontext';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

export default function LoginPage() {
  const {
    login,
    isLoggedIn,
    currentUser,
  } = useApp();

  const router = useRouter();

  // ================= STATE =================

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPass, setShowPass] =
    useState(false);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  // ================= REDIRECT =================

  useEffect(() => {
    if (
      isLoggedIn &&
      currentUser
    ) {
      if (
        currentUser.role ===
        'ADMIN'
      ) {
        router.push(
          '/admin/dashboard'
        );
      } else {
        router.push(
          '/customer/profile'
        );
      }
    }
  }, [
    isLoggedIn,
    currentUser,
    router,
  ]);

  // ================= LOGIN =================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      login(data.user);

      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/dash/profile');
      }
    } catch (error) {
      console.log(error);
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN HANDLER =================
  const handleGoogleLogin = () => {
    // Arahkan ke endpoint integrasi Google Auth Anda (misal NextAuth atau custom route)
    window.location.href = '/api/auth/google';
  };

  // ================= QUICK LOGIN =================

  const quickLogin = (
    type:
      | 'admin'
      | 'customer'
  ) => {
    if (type === 'admin') {
      setEmail(
        'admin@tokosusukita.com'
      );

      setPassword('admin123');
    } else {
      setEmail(
        'budi@email.com'
      );

      setPassword(
        'customer123'
      );
    }
  };

  // ================= UI =================

  if (isLoggedIn) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-start justify-center pt-24 pb-12 p-4">
        <div className="w-full max-w-md">

          {/* LOGO */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center"
            >
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                🍼
              </div>
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mt-4">
              Selamat Datang!
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Masuk ke akun Anda
            </p>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8">

            {/* QUICK LOGIN */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-3">
                Demo Login
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    quickLogin(
                      'admin'
                    )
                  }
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  🔑 Admin
                </button>

                <button
                  type="button"
                  onClick={() =>
                    quickLogin(
                      'customer'
                    )
                  }
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  👤 Customer
                </button>
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >

              {/* EMAIL */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Email
                </label>

                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                  Password
                </label>

                <div className="relative mt-1">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <input
                    type={
                      showPass
                        ? 'text'
                        : 'password'
                    }
                    required
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPass(
                        !showPass
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500"
                  >
                    {showPass ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {/* REMEMBER */}
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                  />

                  <span className="text-xs text-gray-500">
                    Ingat saya
                  </span>
                </label>

                <button
                  type="button"
                  className="text-xs text-blue-600 font-semibold"
                >
                  Lupa password?
                </button>
              </div>

              {/* BUTTON SIGN IN */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  'Masuk ke Akun'
                )}
              </button>

              {/* ─── PERUBAHAN BARU: GOOGLE SIGN-IN BUTTON ─── */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium bg-white px-2">atau</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.436 2.014 15.618 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.305-.176-1.864H12.24z"
                  />
                </svg>
                <span className="text-sm">Masuk dengan Google</span>
              </button>
              {/* ───────────────────────────────────────────── */}

            </form>

            {/* REGISTER */}
            <p className="text-center text-sm text-gray-500 mt-8">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-blue-600 font-bold hover:underline"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}