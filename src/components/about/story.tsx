import Image from 'next/image';

export default function AboutStory() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
      <div>
        <span className="text-blue-600 text-sm font-medium">Cerita Kami</span>
        <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-4">Berawal dari Cinta untuk Sang Buah Hati</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Toko Susu Kita 2 lahir pada tahun 2022 dari sebuah keprihatinan seorang ibu yang kesulitan menemukan produk kebutuhan bayi berkualitas dengan harga terjangkau di satu tempat.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Dengan pengalaman lebih dari 2 tahun, kami telah melayani lebih dari 10.000 pelanggan di seluruh Indonesia. Kami berkomitmen untuk menyediakan produk yang 100% original, bergaransi, dan tersertifikasi BPOM.
        </p>
      </div>
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1672195269523-bb44403e9a5a?w=600&h=400&fit=crop"
          alt="Happy family with baby"
          className="w-full h-80 object-cover rounded-3xl shadow-xl"
        />
        <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-2xl p-4 shadow-xl">
          <div className="text-3xl font-bold">2+</div>
          <div className="text-sm text-blue-100">Tahun Berpengalaman</div>
        </div>
      </div>
    </div>
  );
}