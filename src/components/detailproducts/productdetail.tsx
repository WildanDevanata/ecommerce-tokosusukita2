'use client';

import React from 'react';

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
} from 'lucide-react';

// ================= TYPES =================

interface ProductDetailsProps {
  product: any;

  qty: number;

  setQty: React.Dispatch<
    React.SetStateAction<number>
  >;

  handleAddToCart: (
    qty: number
  ) => void;

  handleBuyNow: (
    qty: number
  ) => void;

  formatRupiah: (
    n: number
  ) => string;
}

// ================= COMPONENT =================

export const ProductDetails = ({
  product,
  qty,
  setQty,
  handleAddToCart,
  handleBuyNow,
  formatRupiah,
}: ProductDetailsProps) => {
  // ================= STATES =================

  const [showNotif, setShowNotif] =
    React.useState(false);

  const [showModal, setShowModal] =
    React.useState(false);

  const [actionType, setActionType] =
    React.useState<
      'cart' | 'buy'
    >('cart');

  // ================= OPEN MODAL =================

  const openCartModal = () => {
    setActionType('cart');

    setShowModal(true);
  };

  const openBuyModal = () => {
    setActionType('buy');

    setShowModal(true);
  };

  // ================= CONFIRM =================

  const handleConfirm = () => {
    if (actionType === 'cart') {
      handleAddToCart(qty);

      setShowNotif(true);

      setTimeout(() => {
        setShowNotif(false);
      }, 2500);
    } else {
      handleBuyNow(qty);
    }

    setShowModal(false);
  };

  // ================= RENDER =================

  return (
    <div className="space-y-4 relative">
  {/* ================= NOTIFICATION ================= */}
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-300 ${
      showNotif
        ? 'opacity-100 scale-100'
        : 'opacity-0 scale-95'
    }`}
  >
    <div className="backdrop-blur-md bg-emerald-500/95 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6" />
      </div>

      <div>
        <p className="text-sm font-bold">
          Berhasil Ditambahkan
        </p>

        <p className="text-xs text-white/90">
          Produk masuk ke
          keranjang
        </p>
      </div>
    </div>
  </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {actionType ===
                'cart'
                  ? 'Tambah ke Keranjang'
                  : 'Beli Sekarang'}
              </h3>

              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-5">
              <div className="flex gap-4">
                {/* IMAGE */}
                <div
                  className={`${
                    product.bgColor ||
                    'bg-gray-100'
                  } w-28 h-28 rounded-2xl flex items-center justify-center flex-shrink-0`}
                >
                  {product.image ? (
                    <img
                      src={
                        product.image
                      }
                      alt={
                        product.name
                      }
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-5xl">
                      {product.emoji ||
                        '🛒'}
                    </span>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 line-clamp-2">
                    {product.name}
                  </h4>

                  <p className="text-blue-600 font-bold text-lg mt-2">
                    {formatRupiah(
                      product.price
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Stok tersedia:{' '}
                    {product.stock}
                  </p>
                </div>
              </div>

              {/* QTY */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Jumlah Produk
                </p>

                <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                  {/* COUNTER */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() =>
                        setQty(
                          (
                            q
                          ) =>
                            Math.max(
                              1,
                              q - 1
                            )
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-12 text-center text-sm font-bold">
                      {qty}
                    </span>

                    <button
                      onClick={() =>
                        setQty(
                          (
                            q
                          ) =>
                            Math.min(
                              product.stock,
                              q + 1
                            )
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* TOTAL */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Total
                    </p>

                    <p className="font-bold text-blue-700">
                      {formatRupiah(
                        product.price *
                          qty
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                className="flex-1 border border-gray-200 py-3 rounded-2xl font-medium hover:bg-gray-50"
              >
                Batal
              </button>

              <button
                onClick={
                  handleConfirm
                }
                className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                {actionType ===
                'cart'
                  ? 'Tambah'
                  : 'Beli Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TITLE ================= */}
      <div>
        <span className="inline-block text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-2">
          {product.categoryName}
        </span>

        <h1 className="text-gray-900 text-xl sm:text-2xl font-bold">
          {product.name}
        </h1>
      </div>

      {/* ================= RATING ================= */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />

          <span className="text-gray-600 font-medium">
            {product.rating}
          </span>
        </div>

        <span className="text-gray-300">
          |
        </span>

        <span className="text-gray-500">
          {
            product.reviewCount
          }{' '}
          ulasan
        </span>

        <span className="text-gray-300">
          |
        </span>

        <span className="text-gray-500">
          {product.soldCount?.toLocaleString()}{' '}
          terjual
        </span>
      </div>

      {/* ================= PRICE ================= */}
      <div className="bg-blue-50 rounded-2xl p-4">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-blue-700">
            {formatRupiah(
              product.price
            )}
          </span>

          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm mb-1">
              {formatRupiah(
                product.originalPrice
              )}
            </span>
          )}
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div className="flex gap-3">
        {/* ADD TO CART */}
        <button
          onClick={
            openCartModal
          }
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-blue-600 text-blue-600 rounded-2xl font-medium hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShoppingCart className="w-5 h-5" />

          Tambah ke Keranjang
        </button>

        {/* BUY NOW */}
        <button
          onClick={
            openBuyModal
          }
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
        >
          Beli Sekarang
        </button>
      </div>

      {/* ================= BENEFITS ================= */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          {
            icon: (
              <Shield className="w-4 h-4 text-green-600" />
            ),
            text: 'Produk Original',
          },

          {
            icon: (
              <Truck className="w-4 h-4 text-blue-600" />
            ),
            text: 'Gratis Ongkir',
          },

          {
            icon: (
              <RotateCcw className="w-4 h-4 text-orange-600" />
            ),
            text: 'Bisa Retur',
          },
        ].map((b, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl"
          >
            {b.icon}

            <p className="text-[10px] font-medium text-gray-700 mt-1">
              {b.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};