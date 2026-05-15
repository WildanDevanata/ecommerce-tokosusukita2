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
  <div className="space-y-5 relative">

    {/* CATEGORY */}
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
          <Star
            key={i}
            className="w-4 h-4 fill-current"
          />
        ))}

        <span className="ml-1 text-gray-700 font-medium">
          {product.rating}
        </span>
      </div>

      <span className="text-gray-300">|</span>

      <span className="text-gray-500">
        {product.reviewCount} ulasan
      </span>

      <span className="text-gray-300">|</span>

      <span className="text-gray-500">
        {product.soldCount?.toLocaleString()} terjual
      </span>
    </div>

    {/* PRICE */}
    <div className="rounded-3xl bg-blue-50 px-5 py-5">
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-5xl font-extrabold text-blue-700 leading-none">
          {formatRupiah(product.price)}
        </span>

        {product.originalPrice && (
          <>
            <span className="mb-1 text-lg text-gray-400 line-through">
              {formatRupiah(product.originalPrice)}
            </span>

            <span className="mb-1 text-red-500 font-semibold">
              Hemat{' '}
              {formatRupiah(
                product.originalPrice -
                  product.price
              )}
            </span>
          </>
        )}
      </div>
    </div>

    {/* STOCK */}
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-green-600">
        <div className="w-2 h-2 rounded-full bg-green-500" />

        <span className="font-medium">
          Stok tersedia
        </span>
      </div>

      <p className="text-gray-500">
        Berat: {(product.weight || 0)}g
      </p>
    </div>

    {/* QUANTITY */}
    <div>
      <p className="mb-3 font-semibold text-gray-800">
        Jumlah:
      </p>

      <div className="flex flex-wrap items-center gap-4">

        {/* COUNTER */}
        <div className="flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white">

          <button
            onClick={() =>
              setQty((q) =>
                Math.max(1, q - 1)
              )
            }
            className="flex h-12 w-12 items-center justify-center hover:bg-gray-50"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-14 text-center font-semibold">
            {qty}
          </span>

          <button
            onClick={() =>
              setQty((q) =>
                Math.min(
                  product.stock,
                  q + 1
                )
              )
            }
            className="flex h-12 w-12 items-center justify-center hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <span className="text-gray-500">
          Stok: {product.stock}
        </span>

        <span className="text-lg font-bold text-blue-700">
          Total:{' '}
          {formatRupiah(
            product.price * qty
          )}
        </span>
      </div>
    </div>

    {/* BUTTONS */}
    <div className="grid grid-cols-2 gap-4 pt-2">

      {/* CART */}
      <button
        onClick={openCartModal}
        className="flex h-14 items-center justify-center gap-3 rounded-2xl border-2 border-blue-600 bg-white text-lg font-semibold text-blue-600 transition-all hover:bg-blue-50"
      >
        <ShoppingCart className="h-5 w-5" />

        Tambah ke Keranjang
      </button>

      {/* BUY */}
      <button
        onClick={openBuyModal}
        className="h-14 rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
      >
        Beli Sekarang
      </button>
    </div>

    {/* EXTRA ACTION */}
    <div className="flex gap-3 pt-1">

      <button className="flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-gray-700 hover:bg-gray-50">
        ❤️ Wishlist
      </button>

      <button className="flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-gray-700 hover:bg-gray-50">
        🔗 Bagikan
      </button>
    </div>

    {/* BENEFITS */}
    <div className="grid grid-cols-3 gap-6 pt-8">

      <div className="text-center">
        <Shield className="mx-auto h-5 w-5 text-green-600" />

        <p className="mt-2 text-sm font-semibold text-gray-800">
          Produk Original
        </p>

        <p className="text-xs text-gray-400">
          Garansi resmi
        </p>
      </div>

      <div className="text-center">
        <Truck className="mx-auto h-5 w-5 text-blue-600" />

        <p className="mt-2 text-sm font-semibold text-gray-800">
          Gratis Ongkir
        </p>

        <p className="text-xs text-gray-400">
          Min. pembelian 200rb
        </p>
      </div>

      <div className="text-center">
        <RotateCcw className="mx-auto h-5 w-5 text-orange-600" />

        <p className="mt-2 text-sm font-semibold text-gray-800">
          Bisa Retur
        </p>

        <p className="text-xs text-gray-400">
          7 hari retur
        </p>
      </div>
    </div>
  </div>
);
};