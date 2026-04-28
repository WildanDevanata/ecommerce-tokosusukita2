import Link from 'next/link';

export default function AboutCTA() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-center text-white">
      <h2 className="text-white text-2xl font-bold mb-3">Siap Belanja untuk Si Kecil?</h2>
      <p className="text-blue-100 mb-6">Temukan ribuan produk bayi berkualitas dengan harga terbaik</p>
      <Link 
        href="/products" 
        className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-2xl font-medium hover:bg-blue-50 transition-all shadow-lg"
      >
        Mulai Belanja 🛍️
      </Link>
    </div>
  );
}