import { useState, useEffect } from 'react';
import Link from 'next/link'
import { ShoppingCart, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  { id: 1, title: 'Nutrisi Terbaik untuk', highlight: 'Buah Hati Anda', subtitle: 'Produk susu formula & kebutuhan bayi berkualitas, original & terpercaya', bg: 'from-blue-600 to-indigo-700', emoji: '🍼', btnText: 'Belanja Sekarang', btnLink: '/products' },
  { id: 2, title: 'MPASI Sehat &', highlight: 'Lezat untuk Bayi', subtitle: 'Pilihan makanan pendamping ASI terbaik untuk tumbuh kembang optimal si kecil', bg: 'from-orange-500 to-pink-600', emoji: '🥣', btnText: 'Lihat MPASI', btnLink: '/products?category=mpasi-makanan' },
  { id: 3, title: 'Vitamin & Suplemen', highlight: 'Daya Tahan Tubuh', subtitle: 'Jaga kesehatan dan imunitas buah hati dengan suplemen berkualitas tinggi', bg: 'from-green-500 to-teal-600', emoji: '💊', btnText: 'Cek Vitamin', btnLink: '/products?category=vitamin-suplemen' },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className={`bg-gradient-to-br ${slide.bg} text-white relative overflow-hidden transition-all duration-700`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm">
              <span>✨</span> Produk Original & Terpercaya
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {slide.title} <br />
              <span className="text-yellow-300">{slide.highlight}</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">{slide.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={slide.btnLink} className="inline-flex items-center gap-2 bg-white text-blue-700 font-medium px-6 py-3 rounded-2xl hover:bg-blue-50 transition-all shadow-lg">
                <ShoppingCart className="w-5 h-5" /> {slide.btnText}
              </Link>
              <Link href="/about" className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 px-6 py-3 rounded-2xl hover:bg-white/30 transition-all">
                Tentang Kami <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center text-9xl">{slide.emoji}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-8 justify-center lg:justify-start">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
      </div>
      <button onClick={() => setCurrentSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => setCurrentSlide(s => (s + 1) % heroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </section>
  );
}