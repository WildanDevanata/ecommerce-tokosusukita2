import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">
          🔍
        </div>

        <h1 className="text-gray-800 text-6xl font-bold mb-2">
          404
        </h1>

        <h2 className="text-gray-700 mb-3">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-gray-500 text-sm mb-8">
          Maaf, halaman yang Anda cari
          tidak ada atau telah
          dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
          >
            🏠 Kembali ke Beranda
          </Link>

          <Link
            href="/products"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            🛍️ Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  );
}