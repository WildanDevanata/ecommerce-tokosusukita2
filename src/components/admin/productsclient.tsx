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
import { Product } from '@/store/appcontext';

export default function ProductsClient() {
  // ================= STATE =================

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');

  const [showModal, setShowModal] = useState(false);

  const [editProduct, setEditProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<Partial<Product & any>>({});

  // ================= FETCH =================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();

      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  // ================= FILTER =================

  const filtered = products.filter((p) => {
    const matchSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchCat =
      filterCat === 'ALL' ||
      (p as any).categoryId === filterCat;

    return matchSearch && matchCat;
  });

  // ================= ACTION =================

const openAdd = () => {
  setEditProduct(null);

  setForm({
    isActive: true,
    image: '',
    bgColor: 'bg-blue-100',
  });

  setShowModal(true);
};

  const openEdit = (product: Product) => {
    setEditProduct(product);

    setForm({
      ...product,
      categoryId: (product as any).category?.id,
    });

    setShowModal(true);
  };

const handleDelete = async (id: string) => {
  if (!confirm('Hapus produk ini?')) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error();
    }

    setProducts((prev) =>
      prev.filter((p) => p.id !== id)
    );

  } catch (error) {
    alert('Gagal menghapus produk');
  }
};

  const handleToggle = async (product: Product) => {
    try {
      const res = await fetch(
        `/api/products/${product.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isActive: !product.isActive,
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Gagal update status');
      }

      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

const handleSave = async () => {
  try {
    setIsSubmitting(true);

    const isEdit = Boolean(editProduct?.id);

    const url = isEdit
      ? `/api/products/${editProduct?.id}`
      : '/api/products';

    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error('Gagal menyimpan produk');
    }

    const savedProduct = await res.json();

    if (isEdit) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === savedProduct.id ? savedProduct : p
        )
      );
    } else {
      setProducts((prev) => [savedProduct, ...prev]);
    }

    setShowModal(false);
    setEditProduct(null);

  } catch (error) {
    console.error(error);
    alert('Terjadi kesalahan');
  } finally {
    setIsSubmitting(false);
  }
};

  // ================= RENDER =================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Produk
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {products.length} produk tersedia
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-medium"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={filterCat}
            onChange={(e) =>
              setFilterCat(e.target.value)
            }
            className="px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          >
            <option value="ALL">
              Semua Kategori
            </option>

            {categories.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  'Produk',
                  'Kategori',
                  'Harga',
                  'Stok',
                  'Status',
                  'Aksi',
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-all"
                >
                  {/* PRODUK */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
  <img
    src={p.image || '/placeholder.png'}
    alt={p.name}
    className="w-full h-full object-cover"
  />
</div>

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {p.name}
                        </h3>

                        <p className="text-sm text-gray-400">
                          {(p as any).weight || 0}g
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* KATEGORI */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                      {(p as any).category?.name}
                    </span>
                  </td>

                  {/* HARGA */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-blue-700">
                        {formatRupiah(p.price)}
                      </p>

                      {(p as any).originalPrice ? (
                        <p className="text-xs text-gray-400 line-through">
                          {formatRupiah(
                            (p as any).originalPrice
                          )}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  {/* STOK */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-700">
                      {p.stock}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleToggle(p)
                      }
                      className="flex items-center gap-2"
                    >
                      {p.isActive ? (
                        <>
                          <ToggleRight className="w-6 h-6 text-green-500" />

                          <span className="text-sm text-green-600 font-medium">
                            Aktif
                          </span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-6 h-6 text-gray-400" />

                          <span className="text-sm text-gray-500 font-medium">
                            Nonaktif
                          </span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* AKSI */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openEdit(p)
                        }
                        className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(p.id)
                        }
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              Tidak ada produk ditemukan
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {/* MODAL */}
{/* MODAL */}
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in fade-in zoom-in duration-200">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Lengkapi informasi produk dengan benar
          </p>
        </div>

        <button
          onClick={() => setShowModal(false)}
          className="rounded-full p-2 transition hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="max-h-[85vh] overflow-y-auto px-8 py-7">

        <div className="space-y-6">

          {/* NAMA */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Nama Produk *
            </label>

            <input
              type="text"
              value={form.name || ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Nama produk..."
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* KATEGORI */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Kategori *
              </label>

              <select
                value={(form as any).categoryId || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="">Pilih kategori</option>

                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>


{/* IMAGE URL */}
<div className="md:col-span-2">
  <label className="mb-2 block text-sm font-semibold text-gray-700">
    Gambar Produk
  </label>

  <input
    type="text"
    placeholder="https://..."
    value={(form as any).image || ''}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        image: e.target.value,
      }))
    }
    className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
  />

  {(form as any).image && (
    <div className="mt-4">
      <img
        src={(form as any).image}
        alt="Preview"
        className="h-28 w-28 rounded-2xl border border-gray-200 object-cover"
      />
    </div>
  )}
</div>

            {/* HARGA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Harga Setelah Diskon (Rp) 
              </label>

              <input
                type="number"
                value={form.price || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                placeholder="85000"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* HARGA ASLI */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Harga Asli (Rp)
              </label>

              <input
                type="number"
                value={(form as any).originalPrice || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    originalPrice: Number(e.target.value),
                  }))
                }
                placeholder="100000 (opsional)"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* STOK */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stok
              </label>

              <input
                type="number"
                value={form.stock || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stock: Number(e.target.value),
                  }))
                }
                placeholder="50"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* BERAT */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Berat (gram)
              </label>

              <input
                type="number"
                value={(form as any).weight || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    weight: Number(e.target.value),
                  }))
                }
                placeholder="400"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* DESKRIPSI */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Deskripsi
            </label>

            <textarea
              rows={5}
              value={(form as any).description || ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Deskripsi produk..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm outline-none transition-all resize-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* CHECKBOX */}
          <div className="flex flex-wrap gap-6 pt-1">

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-gray-700">
                Aktif
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={(form as any).isFeatured || false}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isFeatured: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <span className="text-sm font-medium text-gray-700">
                Featured
              </span>
            </label>
          </div>

          {/* BUTTON */}
          <div className="grid grid-cols-2 gap-4 pt-6">

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="h-14 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="h-14 rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : editProduct
                ? 'Update Produk'
                : 'Simpan Produk'}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}