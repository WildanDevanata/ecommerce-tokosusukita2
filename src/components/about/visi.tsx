export default function AboutVision() {
  const missions = [
    'Menyediakan produk bayi berkualitas premium dengan harga terjangkau',
    'Menjamin keaslian setiap produk yang dijual (100% original)',
    'Memberikan pelayanan pelanggan yang ramah dan responsif',
    'Menghadirkan pengalaman belanja yang mudah dan menyenangkan',
    'Mendukung pertumbuhan dan perkembangan optimal setiap bayi',
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
      <div className="bg-blue-600 rounded-3xl p-8 text-white">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-white text-xl font-bold mb-3">Visi Kami</h3>
        <p className="text-blue-100 leading-relaxed">
          Menjadi platform e-commerce kebutuhan bayi terpercaya dan terlengkap di Indonesia, yang mempermudah setiap orang tua dalam memberikan yang terbaik untuk buah hati mereka.
        </p>
      </div>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-gray-800 text-xl font-bold mb-3">Misi Kami</h3>
        <ul className="space-y-3 text-gray-600 text-sm">
          {missions.map((m, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">✓</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}