'use client';

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mengirim data form ke API Route Next.js
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pesan. Silakan coba lagi nanti.');
      }

      // Jika sukses kirim email
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' }); // Reset form
    } catch (err: any) {
      console.error('Error saat kirim form:', err);
      setError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm animate-fade-in">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Pesan Terkirim!</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Terima kasih telah menghubungi kami. Pesan Anda telah diteruskan langsung ke email kami dan akan kami balas segera.
        </p>
        <button 
          onClick={() => setSent(false)} 
          className="mt-6 text-blue-600 hover:underline text-sm font-medium transition-all"
        >
          Kirim pesan lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-gray-800 font-bold mb-6 text-lg">Kirim Pesan</h3>
      
      {/* Balon Error jika pengiriman gagal */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Nama Lengkap</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              placeholder="Nama Anda" 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
              placeholder="email@anda.com" 
              required 
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400" 
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Subjek</label>
          <input 
            type="text" 
            value={form.subject} 
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
            placeholder="Topik pesan" 
            required 
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400" 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Pesan</label>
          <textarea 
            value={form.message} 
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))} 
            placeholder="Tuliskan pesan..." 
            required 
            rows={5} 
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400" 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-100 active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Sedang Mengirim...' : 'Kirim Pesan Sekarang'}
        </button>
      </form>
    </div>
  );
}