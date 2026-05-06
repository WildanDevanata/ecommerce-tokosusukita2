'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, ToggleLeft, ToggleRight, Landmark, Smartphone } from 'lucide-react';
import { useApp, BankAccount } from '@/store/appcontext';

export default function AdminBankAccountsPage() {
  // Ambil data dan fungsi dari Global Context
  const { bankAccounts, fetchBankAccounts, loading } = useApp();
  
  // State lokal untuk manajemen Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [editAcc, setEditAcc] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<Partial<BankAccount>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi buka modal tambah
  const openAdd = () => {
    setEditAcc(null);
    setForm({ type: 'BANK', isActive: true, color: 'bg-blue-600' });
    setShowModal(true);
  };

  // Fungsi buka modal edit
  const openEdit = (acc: BankAccount) => {
  setEditAcc(acc); // ID penting ada di sini
  setForm(acc);
  setShowModal(true);
};

 // Handler Simpan (Create / Update)
const handleSave = async () => {
  if (!form.bankName || !form.accountNumber || !form.accountName) {
    alert("Mohon lengkapi semua data wajib (*)");
    return;
  }

  try {
    setIsSubmitting(true);
    
    // Tentukan Method dan URL berdasarkan apakah kita sedang EDIT atau TAMBAH
    const isEdit = Boolean(editAcc?.id);
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit 
      ? `/api/bank-accounts/${editAcc?.id}` // Gunakan ID dari editAcc
      : '/api/bank-accounts';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        // Pastikan tipe data konsisten
        isActive: form.isActive ?? true,
      }),
    });

    if (res.ok) {
      await fetchBankAccounts(); // Refresh data global di AppContext
      setShowModal(false);
      setEditAcc(null); // Reset state edit
    } else {
      const errorData = await res.json();
      throw new Error(errorData.message || "Gagal menyimpan");
    }
  } catch (error: any) {
    alert(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

// Handler Hapus
const handleDelete = async (id: string) => {
  if (!id) return;
  if (!confirm('Hapus rekening ini secara permanen?')) return;

  try {
    const res = await fetch(`/api/bank-accounts/${id}`, { 
      method: 'DELETE' 
    });

    if (res.ok) {
      await fetchBankAccounts(); // Refresh data agar UI terupdate
    } else {
      alert("Gagal menghapus data dari server");
    }
  } catch (error) {
    console.error("Delete Error:", error);
    alert("Terjadi kesalahan koneksi");
  }
};

// Handler Toggle Status Aktif (Tanpa Modal)
const handleToggle = async (acc: BankAccount) => {
  try {
    const res = await fetch(`/api/bank-accounts/${acc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !acc.isActive }),
    });

    if (res.ok) {
      await fetchBankAccounts();
    }
  } catch (error) {
    console.error("Toggle Error:", error);
  }
};

  // Filter data untuk tampilan
  const banks = bankAccounts.filter(a => a.type === 'BANK');
  const ewallets = bankAccounts.filter(a => a.type === 'EWALLET');

  if (loading && bankAccounts.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rekening & E-Wallet</h1>
          <p className="text-gray-500 text-sm">Metode pembayaran aktif yang muncul di halaman Checkout</p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-medium"
        >
          <Plus className="w-5 h-5" /> Tambah Rekening
        </button>
      </div>

      {/* List Bank */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <Landmark className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Rekening Bank</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banks.map(acc => (
            <AccountCard 
              key={acc.id} 
              acc={acc} 
              onEdit={openEdit} 
              onDelete={handleDelete} 
              onToggle={() => handleToggle(acc)} 
            />
          ))}
          {banks.length === 0 && <EmptyState text="Belum ada rekening bank" />}
        </div>
      </section>

      {/* List E-Wallet */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <Smartphone className="w-5 h-5" />
          <h2 className="font-semibold text-lg">E-Wallet</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ewallets.map(acc => (
            <AccountCard 
              key={acc.id} 
              acc={acc} 
              onEdit={openEdit} 
              onDelete={handleDelete} 
              onToggle={() => handleToggle(acc)} 
            />
          ))}
          {ewallets.length === 0 && <EmptyState text="Belum ada e-wallet" />}
        </div>
      </section>

      {/* Modal Form */}
{showModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
      
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">
          {editAcc ? 'Edit Rekening' : 'Tambah Rekening'}
        </h3>
        <button 
          onClick={() => setShowModal(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-8 space-y-6">
        {/* Tipe Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Tipe</label>
          <div className="flex gap-4">
            <button
              onClick={() => setForm({...form, type: 'BANK'})}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium ${
                form.type === 'BANK' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              <span>🏦</span> Bank
            </button>
            <button
              onClick={() => setForm({...form, type: 'EWALLET'})}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-medium ${
                form.type === 'EWALLET' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              <span>📱</span> E-Wallet
            </button>
          </div>
        </div>

        {/* Input Nama Bank */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nama Bank/E-Wallet *</label>
          <input 
            placeholder="Bank BCA / GoPay"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
            value={form.bankName || ''}
            onChange={e => setForm({...form, bankName: e.target.value})}
          />
        </div>

        {/* Input No Rekening */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">No. Rekening/ID *</label>
          <input 
            placeholder="1234567890"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
            value={form.accountNumber || ''}
            onChange={e => setForm({...form, accountNumber: e.target.value})}
          />
        </div>

        {/* Input Nama Pemilik */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nama Pemilik *</label>
          <input 
            placeholder="Toko Susu Kita 2"
            className="w-full px-4 py-3.5 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400"
            value={form.accountName || ''}
            onChange={e => setForm({...form, accountName: e.target.value})}
          />
        </div>

        {/* Checkbox Aktifkan */}
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <input 
            type="checkbox"
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={form.isActive ?? true}
            onChange={e => setForm({...form, isActive: e.target.checked})}
          />
          <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
            Aktifkan rekening ini
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setShowModal(false)}
            className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button 
            disabled={isSubmitting}
            onClick={handleSave}
            className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// Sub-komponen untuk Card
function AccountCard({ acc, onEdit, onDelete, onToggle }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${acc.isActive ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${acc.isActive ? (acc.color || 'bg-blue-600') : 'bg-gray-400'} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
          {acc.bankName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex gap-1">
          <button onClick={onToggle} className="p-2 hover:bg-gray-100 rounded-lg">
            {acc.isActive ? <ToggleRight className="text-green-500 w-6 h-6" /> : <ToggleLeft className="text-gray-400 w-6 h-6" />}
          </button>
          <button onClick={() => onEdit(acc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-5 h-5" /></button>
          <button onClick={() => onDelete(acc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>
      <h3 className="font-bold text-gray-800 text-lg">{acc.bankName}</h3>
      <p className="text-blue-600 font-mono text-xl font-bold tracking-tighter">{acc.accountNumber}</p>
      <p className="text-xs text-gray-400 font-medium uppercase mt-1">A.N. {acc.accountName}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="col-span-full p-12 border-2 border-dashed rounded-3xl text-center text-gray-400">
      {text}
    </div>
  );
}