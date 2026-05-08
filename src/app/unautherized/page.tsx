'use client';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">
          🚫
        </div>

        <h1 className="text-gray-800 text-5xl font-bold mb-2">
          403
        </h1>

        <h2 className="text-gray-700 mb-3">
          Akses Ditolak
        </h2>

        <p className="text-gray-500 text-sm mb-2">
          Anda tidak memiliki izin
          untuk mengakses halaman ini.
        </p>

        <p className="text-gray-400 text-xs mb-8">
          Halaman Admin hanya dapat
          diakses oleh pengguna dengan
          role <strong>ADMIN</strong>.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left">
          <p className="text-sm text-red-700 font-medium mb-2">
            🔐 Middleware Proteksi
            Aktif
          </p>

          <p className="text-xs text-red-600">
            Route
            /dashboard/admin/*
            dilindungi dan hanya dapat
            diakses oleh
            Administrator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() =>
              router.back()
            }
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            ← Kembali
          </button>

          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
          >
            🏠 Ke Beranda
          </Link>

          <Link
            href="/login"
            className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors"
          >
            🔑 Login sebagai
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}