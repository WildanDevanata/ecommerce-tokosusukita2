export default function ContactMap() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="bg-blue-50 h-64 flex flex-col items-center justify-center gap-3">
        <span className="text-5xl">🗺️</span>
        <div className="text-center">
          <p className="text-gray-700 font-bold">Lokasi Toko Fisik</p>
          <p className="text-gray-500 text-sm px-4">Jl. Pahlawan No.15a, Tambran, Kec. Magetan, Kabupaten Magetan, Jawa Timur 63318</p>
        </div>
        <a href="https://www.google.com/maps/place/Jl.+Pahlawan+No.15a,+Tambran,+Kec.+Magetan,+Kabupaten+Magetan,+Jawa+Timur+63318/@-7.6546971,111.3330636,19.5z/data=!4m6!3m5!1s0x2e7993cd58ecca0f:0xdc8830371d0a03f!8m2!3d-7.6546229!4d111.3331927!16s%2Fg%2F11rkmbtfdy?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D" className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all">
          Buka di Google Maps
        </a>
      </div>
    </div>
  );
}