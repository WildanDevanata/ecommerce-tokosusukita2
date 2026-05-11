'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center shadow-sm">

        <div className="text-7xl mb-4">
          🚫
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          403
        </h1>

        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Unauthorized
        </h2>

        <p className="text-sm text-gray-500 mb-8">
          Anda tidak memiliki akses ke halaman admin.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="w-full py-3 rounded-2xl border border-gray-300 hover:bg-gray-100 transition"
          >
            ← Kembali
          </button>

          <Link
            href="/login"
            className="w-full py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Login
          </Link>

          <Link
            href="/"
            className="w-full py-3 rounded-2xl bg-gray-800 text-white hover:bg-black transition"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}