'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Untuk deteksi menu aktif
import { 
  ShoppingCart, 
  Menu, 
  User, 
  Heart,
  X 
} from "lucide-react";
import { useApp } from "@/store/appcontext";

export default function Navbar() {
  const { cart, isLoggedIn } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Daftar Menu Navigasi
  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo - Sesuai Gambar */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-blue-200 shadow-lg">
              🍼
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-blue-700">Toko Susu</span>
              <span className="text-xm text-gray-600 font-medium">Kita 2</span>
            </div>
          </Link>

          {/* Center Navigation Menu - PENGGANTI SEARCH BAR */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all px-4 py-2 rounded-xl ${
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons (Right Side) */}
          <div className="flex items-center gap-3">
            {/* Cart & Wishlist icons tetap ada tapi lebih simpel */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {cart?.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>

            {isLoggedIn ? (
              <Link href="/profile" className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-3"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-2 shadow-xl animate-in slide-in-from-top">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block p-3 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              {link.name}
            </Link>
          ))}
          <hr className="my-2 border-gray-50" />
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/login" className="text-center py-3 text-blue-600 font-bold border border-blue-100 rounded-xl">Masuk</Link>
              <Link href="/register" className="text-center py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}