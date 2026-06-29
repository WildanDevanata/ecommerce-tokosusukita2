import Link from "next/link";
import { 
  X,   // Gunakan Twitter atau X
  Mail, 
  MapPin, 
  Phone 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Definisikan array sosial media secara eksplisit agar tidak bingung di mapping
  const socialLinks = [
    { Icon: X, href: "#" }, // Bisa diganti ke X jika ingin logo terbaru
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🍼</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                BabyStore
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Pusat perlengkapan bayi terlengkap dan terpercaya di Indonesia. Kami menyediakan nutrisi dan kebutuhan terbaik untuk buah hati Anda.
            </p>
            
            {/* Social Media Links - DIPERBAIKI */}
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-xl text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* ... Bagian Quick Links, Support, dan Contact tetap sama ... */}
          
          {/* Support */}
          <div>
            <h4 className="text-gray-800 font-bold mb-6">Bantuan</h4>
            <ul className="space-y-4">
              {["Tentang Kami", "Cara Berbelanja", "Kebijakan Pengembalian", "Lacak Pesanan", "FAQ"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gray-800 font-bold mb-6">Kontak Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Jl. Melati No. 123, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>halo@babystore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer tetap sama */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Toko Susu kita 2. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-medium italic">Metode Pembayaran</span>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-gray-100 rounded-md"></div>
              <div className="w-10 h-6 bg-gray-100 rounded-md"></div>
              <div className="w-10 h-6 bg-gray-100 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}