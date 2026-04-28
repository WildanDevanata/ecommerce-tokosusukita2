import { Truck, Shield, Award, Clock } from 'lucide-react';

export default function Features() {
  const features = [
    { icon: <Truck className="w-5 h-5 text-blue-600" />, title: 'Pengiriman Cepat', desc: 'Ke seluruh Indonesia' },
    { icon: <Shield className="w-5 h-5 text-green-600" />, title: 'Produk Original', desc: 'Resmi & bergaransi' },
    { icon: <Award className="w-5 h-5 text-orange-600" />, title: 'Kualitas Terjamin', desc: 'Tersertifikasi BPOM' },
    { icon: <Clock className="w-5 h-5 text-purple-600" />, title: 'Layanan 24 Jam', desc: 'Siap membantu Anda' },
  ];

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="p-2 bg-gray-50 rounded-xl flex-shrink-0">{f.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}