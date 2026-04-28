export default function AboutStats() {
  const stats = [
    { value: '10K+', label: 'Pelanggan Puas', emoji: '😊' },
    { value: '500+', label: 'Produk Tersedia', emoji: '📦' },
    { value: '4.9⭐', label: 'Rating Toko', emoji: '⭐' },
    { value: '100%', label: 'Produk Original', emoji: '✅' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
          <div className="text-3xl mb-2">{s.emoji}</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
          <div className="text-sm text-gray-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}