export default function ContactMap() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="bg-blue-50 h-64 flex flex-col items-center justify-center gap-3">
        <span className="text-5xl">🗺️</span>
        <div className="text-center">
          <p className="text-gray-700 font-bold">Lokasi Toko Fisik</p>
          <p className="text-gray-500 text-sm px-4">Jl. Raya Susu Kita No. 1, Jakarta Selatan</p>
        </div>
        <a href="#" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}