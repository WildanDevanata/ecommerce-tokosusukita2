import Link from 'next/link';
import Navbar from "@/components/sharing/navbar";
import Footer from "@/components/sharing/footer";
import ContactSidebar from "@/components/contacts/sidebar";
import ContactForm from "@/components/contacts/form";
import ContactMap from "@/components/contacts/map";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <nav className="text-blue-200 text-sm mb-4">
              <Link href="/" className="hover:text-white">Beranda</Link> / <span className="text-white">Kontak</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Hubungi Kami</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar (Info & Jam Kerja) */}
            <ContactSidebar />

            {/* Main Content (Form & Map) */}
            <div className="lg:col-span-2 space-y-6">
              <ContactForm />
              <ContactMap />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}