import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

export default function ContactSidebar() {
  const contactInfo = [
    { icon: <MapPin className="w-5 h-5 text-blue-600" />, label: 'Alamat', value: 'Jl. Pahlawan No.15a, Tambran, Kec. Magetan, Kabupaten Magetan, Jawa Timur 63318' },
    { icon: <Phone className="w-5 h-5 text-green-600" />, label: 'Telepon / WhatsApp', value: '0813-5703-7350' },
    { icon: <Mail className="w-5 h-5 text-orange-600" />, label: 'Email', value: 'info@tokosusukita.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-4">Informasi Kontak</h3>
        <div className="space-y-4">
          {contactInfo.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm text-gray-700">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <a href="https://wa.me/6281357037350" target="_blank" rel="noopener noreferrer" className="mt-6 w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-2xl hover:bg-green-600 transition-colors font-medium text-sm">
          <MessageCircle className="w-5 h-5" /> Chat WhatsApp Sekarang
        </a>
      </div>

      {/* Bagian Jam Operasional bisa kamu biarkan di sini atau pisah lagi jika mau */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-gray-800 font-bold">Jam Operasional</h3>
        </div>
        <div className="space-y-3">
          {[
            { day: 'Senin – Jumat', hours: '08.00 – 21.00 WIB', open: true },
            { day: 'Sabtu', hours: '08.00 – 18.00 WIB', open: true },
            { day: 'Minggu', hours: '09.00 – 15.00 WIB', open: true },
            { day: 'Hari Libur Nasional', hours: 'Tutup', open: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{s.day}</span>
              <span className={`text-sm font-medium ${s.open ? 'text-green-600' : 'text-red-500'}`}>{s.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}