'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { formatRupiah } from '@/lib/helpers';
import { useApp, Product } from '@/store/appcontext';

export default function ProductsClient() {
//   const { deleteProduct } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ✅ state edit
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  // ================= FETCH =================
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  // ================= FILTER =================
  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());

    const matchCat =
      filterCat === 'ALL' ||
      (p as any).category?.id === filterCat;

    return matchSearch && matchCat;
  });

  // ================= ACTION =================

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm(product);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus produk ini?')) {
      deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id)); // sync UI
    }
  };

  const handleToggle = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  // ================= RENDER =================

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm">
            {products.length} total produk
          </p>
        </div>

        <button
          onClick={() => {
            setEditProduct(null);
            setForm({});
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">

          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="cat1">Susu Formula</option>
            <option value="cat2">MPASI</option>
            <option value="cat3">Vitamin</option>
            <option value="cat4">Perawatan</option>
          </select>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['No','Produk','Kategori','Harga','Stok','Status','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">

                  {/* NO */}
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {i + 1}
                  </td>

                  {/* PRODUK */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`${p.bgColor} w-10 h-10 rounded-xl flex items-center justify-center`}>
                        {p.emoji}
                      </div>
                      <div>
                        <p className="text-sm">{p.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* KATEGORI */}
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {p.category?.name}
                    </span>
                  </td>

                  {/* HARGA */}
                  <td className="px-4 py-3 font-bold text-blue-700">
                    {formatRupiah(p.price)}
                  </td>

                  {/* STOK */}
                  <td className="px-4 py-3 text-sm">
                    {p.stock}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(p.id)}
                      className="flex items-center gap-1.5"
                    >
                      {p.isActive ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-green-500"/>
                          <span className="text-xs text-green-600">Aktif</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-gray-400"/>
                          <span className="text-xs text-gray-500">Nonaktif</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* AKSI */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        <Edit3 className="w-4 h-4"/>
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Tidak ada produk
            </div>
          )}
        </div>
      </div>

      {/* MODAL (SIMPLE) */}
      {/* MODAL (STYLISH) */}
{showModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
      
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">
          {editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h3>
        <button 
          onClick={() => setShowModal(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
        
        {/* Nama Produk */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Nama Produk *</label>
          <input 
            value={form.name || ''}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nama produk..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Kategori *</label>
            <select 
              value={(form as any).categoryId || ''}
              onChange={e => setForm(f => ({ ...f, categoryId: e.target.value } as any))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
            >
              <option value="">Pilih kategori</option>
              <option value="cat1">Susu Formula</option>
              <option value="cat2">MPASI</option>
              <option value="cat3">Vitamin</option>
            </select>
          </div>

          {/* Emoji */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Emoji Produk</label>
            <input 
              value={form.emoji || ''}
              onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              placeholder="📦"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Harga Jual */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Harga (Rp) *</label>
            <input 
              type="number"
              value={form.price || ''}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              placeholder="85000"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Harga Asli (Coret) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Harga Asli (Rp)</label>
            <input 
              type="number"
              placeholder="100000 (opsional)"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Stok */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Stok</label>
            <input 
              type="number"
              value={form.stock || ''}
              onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
              placeholder="50"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Berat */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Berat (gram)</label>
            <input 
              type="number"
              placeholder="400"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea 
            rows={3}
            placeholder="Deskripsi produk..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
            />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Aktif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox"
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
            />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Featured</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setShowModal(false)}
            className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            Batal
          </button>
          <button 
            className="flex-1 py-4 px-6 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Simpan Produk
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </div>
  );
}