import React from 'react';
import { Star, ShoppingCart, Minus, Plus, Heart, Share2, Shield, Truck, RotateCcw } from 'lucide-react';

interface ProductDetailsProps {
  product: any;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  formatRupiah: (n: number) => string;
}

export const ProductDetails = ({ product, qty, setQty, handleAddToCart, handleBuyNow, formatRupiah }: ProductDetailsProps) => {
  const [inWishlist, setInWishlist] = React.useState(false);

  return (
    <div className="space-y-4">
      <div>
        <span className="inline-block text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-2">{product.categoryName}</span>
        <h1 className="text-gray-900 text-xl sm:text-2xl font-bold">{product.name}</h1>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-gray-600 font-medium">{product.rating}</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{product.reviewCount} ulasan</span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500">{product.soldCount?.toLocaleString()} terjual</span>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-blue-700">{formatRupiah(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm mb-1">{formatRupiah(product.originalPrice)}</span>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Jumlah:</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
            <span className="w-12 text-center text-sm font-medium">{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
          </div>
          <span className="text-sm text-gray-500">Stok: {product.stock}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-blue-600 text-blue-600 rounded-2xl font-medium hover:bg-blue-50 transition-all">
          <ShoppingCart className="w-5 h-5" /> Tambah ke Keranjang
        </button>
        <button onClick={handleBuyNow} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-blue-700">
          Beli Sekarang
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[{ icon: <Shield className="w-4 h-4 text-green-600" />, text: 'Produk Original' },
          { icon: <Truck className="w-4 h-4 text-blue-600" />, text: 'Gratis Ongkir' },
          { icon: <RotateCcw className="w-4 h-4 text-orange-600" />, text: 'Bisa Retur' }].map((b, i) => (
          <div key={i} className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-xl">
            {b.icon}
            <p className="text-[10px] font-medium text-gray-700 mt-1">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};