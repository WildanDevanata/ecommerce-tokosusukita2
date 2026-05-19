'use client';

import React from 'react';
import Image from 'next/image';
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';

interface ProductDetailsProps {
  product: any;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  handleAddToCart: (qty: number) => void;
  handleBuyNow: (qty: number) => void;
  formatRupiah: (n: number) => string;
  isCustomer: boolean; // 👈 Menerima prop role check
}

export const ProductDetails = ({
  product,
  qty,
  setQty,
  handleAddToCart,
  handleBuyNow,
  formatRupiah,
  isCustomer,
}: ProductDetailsProps) => {
  const [showNotif, setShowNotif] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [actionType, setActionType] = React.useState<'cart' | 'buy'>('cart');

  const openCartModal = () => {
    if (!isCustomer) return;
    setActionType('cart');
    setShowModal(true);
  };

  const openBuyModal = () => {
    if (!isCustomer) return;
    setActionType('buy');
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (actionType === 'cart') {
      handleAddToCart(qty);
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2500);
    } else {
      handleBuyNow(qty);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-5 relative">
      {/* TOAST NOTIFIKASI */}
      {showNotif && (
        <div className="fixed top-24 right-5 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-green-500 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm font-semibold">
            {qty}x {product.name} berhasil masuk keranjang!
          </div>
        </div>
      )}

      {/* HEADER TITLE */}
      <div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
          {product.categoryName}
        </span>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
          {product.name}
        </h1>
      </div>

      {/* RATING */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1 text-yellow-400">
          {[1, 2, 3, 4].map((i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
          <span className="ml-1 text-gray-700 font-medium">{product.rating}</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{product.reviewCount} ulasan</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{product.soldCount.toLocaleString()} terjual</span>
      </div>

      {/* PRICE PANEL */}
      <div className="rounded-3xl bg-blue-50 px-5 py-5">
        <span className="text-4xl font-black text-blue-700 leading-none">
          {formatRupiah(product.price)}
        </span>
      </div>

      {/* STOCK INFO */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-medium">Stok tersedia</span>
        </div>
      </div>

      {/* MAIN COUNTER */}
      <div>
        <p className="mb-3 font-semibold text-gray-800 text-sm">Jumlah:</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              disabled={!isCustomer}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className={`w-12 text-center font-bold ${isCustomer ? 'text-gray-800' : 'text-gray-300'}`}>
              {qty}
            </span>
            <button
              type="button"
              disabled={!isCustomer}
              onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
              className="flex h-11 w-11 items-center justify-center hover:bg-gray-50 text-gray-600 disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-400 font-medium">Stok: {product.stock}</span>
          <span className="text-base font-bold text-gray-800 ml-auto">
            Total: <span className="text-xl font-black text-blue-700">{formatRupiah(product.price * qty)}</span>
          </span>
        </div>
      </div>

      {/* BELI & KERANJANG BUTTONS */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={openCartModal}
          disabled={!isCustomer || product.stock <= 0}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-blue-600 bg-white text-base font-bold text-blue-600 transition-all hover:bg-blue-50 disabled:opacity-40 disabled:border-gray-200 disabled:text-gray-400"
        >
          <ShoppingCart className="h-5 w-5" />
          Keranjang
        </button>

        <button
          type="button"
          onClick={openBuyModal}
          disabled={!isCustomer || product.stock <= 0}
          className="h-14 rounded-2xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-40 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          Beli Sekarang
        </button>
      </div>

      {/* INFO NOTIFIKASI ROLE */}
      {!isCustomer && (
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Login akun agar bisa order produk.</span>
        </div>
      )}

      {/* BENEFIT BAR */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
        <div>
          <Shield className="mx-auto h-5 w-5 text-green-600" />
          <p className="mt-1.5 text-xs font-bold text-gray-800">Original</p>
        </div>
        <div>
          <Truck className="mx-auto h-5 w-5 text-blue-600" />
          <p className="mt-1.5 text-xs font-bold text-gray-800">Free Ongkir</p>
        </div>
        <div>
          <RotateCcw className="mx-auto h-5 w-5 text-orange-600" />
          <p className="mt-1.5 text-xs font-bold text-gray-800">Bisa Retur</p>
        </div>
      </div>

      {/* MODAL DIALOG POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[28px] w-full max-w-md shadow-2xl p-6 border border-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${actionType === 'cart' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-800">Konfirmasi Pesanan</h3>
              <p className="text-sm text-gray-500 mt-1">Tinjau kembali rincian produk sebelum melanjutkan.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100 items-center">
              <div className="col-span-1 aspect-square bg-white border border-gray-200/80 rounded-xl flex items-center justify-center overflow-hidden relative shadow-inner">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill sizes="100px" className="object-contain p-1.5" />
                ) : (
                  <span className="text-3xl">🥛</span>
                )}
              </div>

              <div className="col-span-2 space-y-1.5 text-xs pl-1">
                <h4 className="font-bold text-gray-800 line-clamp-1 text-sm">{product.name}</h4>
                <p className="text-gray-400 font-medium">Harga: <span className="text-gray-600 font-semibold">{formatRupiah(product.price)}</span></p>

                <div className="flex justify-between items-center pt-1 border-t border-gray-200/60 mt-1">
                  <span className="text-gray-500 font-medium">Jumlah:</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm scale-90 origin-right">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-1.5 hover:bg-gray-50 text-gray-500"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-black text-gray-800 text-xs">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                      className="p-1.5 hover:bg-gray-50 text-gray-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-xl p-3 flex justify-between items-center text-sm border border-blue-100/30">
              <span className="text-blue-900 font-bold">Total Bayar ({qty} Unit):</span>
              <span className="font-black text-blue-700 text-base">{formatRupiah(product.price * qty)}</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`flex-1 py-3 text-white rounded-xl font-bold text-sm shadow-lg ${actionType === 'cart' ? 'bg-blue-600' : 'bg-green-600'
                  }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};