'use client';

import { useState } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import { useApp, Category } from '@/store/appcontext';

export default function AdminCategoriesPage() {
  // Gunakan fungsi aksi langsung dari Context agar logika terpusat
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>({});

  const openAdd = () => { 
    setEditCat(null); 
    setForm({ 
      name: '',
      description: '',
      icon: '📦',
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50' 
    }); 
    setShowModal(true); 
  };

  const openEdit = (c: Category) => { 
    setEditCat(c); 
    setForm(c); 
    setShowModal(true); 
  };

  const handleDelete = (id: string) => { 
    if (confirm('Hapus kategori ini? Semua data terkait mungkin akan terpengaruh.')) {
      deleteCategory(id); 
    }
  };

  const handleSave = () => {
    if (!form.name) {
      alert("Nama kategori harus diisi!");
      return;
    }

    // Generate slug otomatis
    const generatedSlug = form.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/&/g, 'dan')
      .replace(/[^\w-]+/g, '');

    if (editCat) {
      // Gunakan aksi updateCategory dari context
      updateCategory(editCat.id, {
        ...form,
        slug: generatedSlug
      });
    } else {
      // Gunakan aksi addCategory dari context
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: form.name,
        slug: generatedSlug,
        description: form.description || '',
        icon: form.icon || '📦',
        color: form.color || 'text-blue-600',
        bgColor: form.bgColor || 'bg-blue-50',
        productCount: 0,
      };
      addCategory(newCategory);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kategori</h1>
          <p className="text-gray-500 text-sm">{categories.length} kategori terdaftar</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm font-bold"
        >
          <Plus className="w-5 h-5" /> Tambah Kategori
        </button>
      </div>

      {/* Grid Kategori */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div className={`w-14 h-14 ${cat.bgColor} ${cat.color} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                {cat.icon}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-800 mb-1">{cat.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
  {cat.description || 'Tidak ada deskripsi untuk kategori ini.'}
</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                /{cat.slug}
              </span>
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                {cat.productCount || 0} Produk
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-800">{editCat ? 'Edit Kategori' : 'Kategori Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Nama Kategori</label>
                <input 
                  autoFocus
                  value={form.name || ''} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Perlengkapan Mandi" 
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Icon</label>
                  <input 
                    value={form.icon || ''} 
                    onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🍼" 
                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl text-center text-xl focus:ring-2 focus:ring-blue-500 transition-all" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Slug Preview</label>
                  <div className="w-full px-5 py-4 bg-gray-100 rounded-xl text-xs font-mono text-gray-500 truncate">
                    {form.name ? form.name.toLowerCase().replace(/\s+/g, '-') : 'otomatis-slug'}
                  </div>
                </div>
              </div>

                            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                    Deskripsi Kategori
                </label>
                <textarea 
                    rows={3}
                    value={form.description || ''} 
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Contoh: Susu untuk mendukung tumbuh kembang anak..." 
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none" 
                />
                </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  {editCat ? 'Update' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}