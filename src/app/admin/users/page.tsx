'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  createdAt: string;
  orderCount: number;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  
  // State Baru untuk Form Edit & Hapus
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isActive: true
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const filtered = users.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === 'ALL' || user.role === filterRole;

    return matchSearch && matchRole;
  });

  const toggleStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;

    const updated = !target.isActive;

    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: updated }),
    });

    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: updated } : u));
  };

  // Handler membuka Modal Edit
  const handleOpenEdit = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      isActive: user.isActive
    });
    setFormError('');
  };

  // Handler kirim Data Edit ke API
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setFormError('Konfirmasi password tidak cocok!');
      return;
    }

    try {
      setSubmitLoading(true);
      setFormError('');

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          isActive: editForm.isActive,
          ...(editForm.password ? { password: editForm.password } : {})
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Gagal mengubah data user');

      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handler Hapus User
  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}" secara permanen?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menghapus user');
      }
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalAdmins = users.filter(u => u.role === 'ADMIN').length;
  const totalCustomers = users.filter(u => u.role === 'CUSTOMER').length;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-600">Total Pengguna</p>
          <h3 className="text-2xl font-bold text-blue-700">{users.length}</h3>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4">
          <p className="text-sm text-purple-600">Administrator</p>
          <h3 className="text-2xl font-bold text-purple-700">{totalAdmins}</h3>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-600">Customer</p>
          <h3 className="text-2xl font-bold text-green-700">{totalCustomers}</h3>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap">
        <div className="flex-1 relative min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari user..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm"
          />
        </div>

        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
        >
          <option value="ALL">Semua Role</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['No', 'Pengguna', 'Role', 'Pesanan', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, i) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.orderCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(user.id)}>
                      {user.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-500"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* TOMBOL EDIT */}
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* TOMBOL HAPUS */}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL (Eksisting) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Detail Pengguna</h3>
              <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-medium text-gray-800">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">No. Telepon</p>
                <p className="text-sm font-medium text-gray-800">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Bergabung</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT (Baru, Sesuai Request Form Lengkap) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md my-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-800 tracking-tight">Edit Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Contoh: 0812345..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Status Akun</label>
                <select
                  value={editForm.isActive ? 'true' : 'false'}
                  onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="true">Aktif (Bisa Transaksi)</option>
                  <option value="false">Nonaktif (Ditangguhkan)</option>
                </select>
              </div>

              {/* WARNING DI ATAS FIELD PASSWORD */}
              <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded-xl p-2.5 text-[11px] font-medium flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Kosongkan kolom password jika tidak ingin mengubahnya.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Minimal 8 karakter"
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Konfirmasi</label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={e => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {submitLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}