import Link from 'next/link';

export default function AboutHero() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="text-blue-200 text-sm mb-4">
          <Link href="/" className="hover:text-white">Beranda</Link> / <span className="text-white">Tentang Kami</span>
        </nav>
        <h1 className="text-white text-4xl sm:text-5xl mb-4">Tentang Toko Susu Kita 2</h1>
        <p className="text-blue-100 text-lg max-w-2xl">Kami hadir untuk memastikan buah hati Anda mendapatkan nutrisi terbaik dari produk-produk berkualitas pilihan</p>
      </div>
    </div>
  );
}