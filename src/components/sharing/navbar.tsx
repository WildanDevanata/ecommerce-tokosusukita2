'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { usePathname } from 'next/navigation';

import {
  ShoppingCart,
  Menu,
  User,
  Heart,
  X,
  Package,
  ChevronDown,
  LogOut,
} from 'lucide-react';

import { useApp } from '@/store/appcontext';

export default function Navbar() {
  const {
    cart,
    isLoggedIn,
    currentUser,
    logout,
  } = useApp();

  const pathname = usePathname();

  // ================= HYDRATION FIX =================

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ================= MOBILE MENU =================

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // ================= CLOSE DROPDOWN =================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // ================= PREVENT HYDRATION ERROR =================

  if (!mounted) return null;

  // ================= ROLE =================

  const isCustomer =
    isLoggedIn &&
    currentUser?.role ===
      'CUSTOMER';

  const isAdmin =
    isLoggedIn &&
    currentUser?.role ===
      'ADMIN';

  // ================= NAVIGATION =================

  const navLinks = [
    {
      name: 'Beranda',
      href: '/',
    },
    {
      name: 'Produk',
      href: '/products',
    },
    {
      name: 'Tentang Kami',
      href: '/about',
    },
    {
      name: 'Kontak',
      href: '/contact',
    },
  ];

  // ================= LOGOUT =================

  const handleLogout = () => {
    logout();

    window.location.href =
      '/login';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-blue-200 shadow-lg">
              🍼
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-blue-700">
                Toko Susu
              </span>

              <span className="text-sm text-gray-600 font-medium">
                Kita 2
              </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => {
              const isActive =
                pathname ===
                link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all px-4 py-2 rounded-xl ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isCustomer && (
              <Link
                href="/customer/orders"
                className={`flex items-center gap-2 text-sm font-medium transition-all px-4 py-2 rounded-xl ${
                  pathname.startsWith(
                    '/customer/orders'
                  )
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Pesanan
              </Link>
            )}
          </div>

          {/* RIGHT ACTION */}
          <div className="flex items-center gap-2">

            {/* CUSTOMER ICON */}
            {isCustomer && (
              <div className="hidden sm:flex items-center gap-1 mr-2">

                {/* WISHLIST */}
                <Link
                  href="/customer/wishlist"
                  className={`p-2 rounded-xl transition-colors ${
                    pathname ===
                    '/customer/wishlist'
                      ? 'bg-red-50 text-red-500'
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* CART */}
                <Link
                  href="/customer/cart"
                  className={`p-2 rounded-xl transition-colors relative ${
                    pathname ===
                    '/customer/cart'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />

                  {cart?.length >
                    0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* USER MENU */}
            {isLoggedIn ? (
              <div
                className="relative"
                ref={dropdownRef}
              >
                <button
                  onClick={() =>
                    setIsUserMenuOpen(
                      !isUserMenuOpen
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all">
                    <User className="w-5 h-5" />
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-700 leading-tight">
                      {currentUser?.name}
                    </p>

                    <p className="text-[11px] text-gray-400 uppercase">
                      {currentUser?.role}
                    </p>
                  </div>

                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* DROPDOWN */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">

                    {/* USER INFO */}
                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {currentUser?.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {currentUser?.email}
                      </p>
                    </div>

                    {/* PROFILE */}
                    <Link
                      href={
                        isAdmin
                          ? '/admin/profile'
                          : '/customer/profile'
                      }
                      onClick={() =>
                        setIsUserMenuOpen(
                          false
                        )
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>

                    {/* LOGOUT */}
                    <button
                      onClick={
                        handleLogout
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
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

            {/* MOBILE BUTTON */}
            <button
              onClick={() =>
                setIsMobileMenuOpen(
                  !isMobileMenuOpen
                )
              }
              className="md:hidden p-2 text-gray-600"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}