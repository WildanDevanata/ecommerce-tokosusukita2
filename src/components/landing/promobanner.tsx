import Link from 'next/link'
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-20 select-none">🎁</div>
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm mb-4">
              🎉 Penawaran Spesial Hari Ini
            </div>
            <h2 className="text-3xl sm:text-4xl text-white mb-3 font-bold">Diskon hingga <span className="text-yellow-300">50%</span></h2>
            <p className="text-white/80 mb-6">Dapatkan penawaran terbaik untuk produk pilihan. Berlaku hari ini saja!</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-white text-orange-600 font-medium px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all shadow-lg">
              Belanja Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}