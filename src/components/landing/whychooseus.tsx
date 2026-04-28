export default function WhyChooseUs() {
  const reasons = [
    { emoji: '🏆', title: 'Produk Original', desc: 'Semua produk kami 100% original, bergaransi resmi dari distributor resmi' },
    { emoji: '🚀', title: 'Pengiriman Cepat', desc: 'Pengiriman same-day untuk area Jakarta dan 1-3 hari ke seluruh Indonesia' },
    { emoji: '💰', title: 'Harga Terbaik', desc: 'Harga kompetitif dengan kualitas premium, hemat lebih banyak dengan promo kami' },
    { emoji: '🎧', title: 'Layanan Prima', desc: 'Customer service siap membantu 24 jam / 7 hari via WhatsApp, email & telepon' },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-gray-800 text-2xl font-bold">Mengapa Pilih Kami?</h2>
          <p className="text-gray-500 mt-2">Kami hadir untuk memberikan yang terbaik bagi buah hati Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{item.emoji}</div>
              <h3 className="text-gray-800 mb-2 font-bold">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}