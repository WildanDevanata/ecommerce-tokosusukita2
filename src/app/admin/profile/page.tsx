'use client';

import { useEffect, useState } from 'react';

import {
  User,
  Mail,
  Phone,
  Save,
  Camera,
  Check,
} from 'lucide-react';

type UserType = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
};

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] =
    useState<UserType | null>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const [saved, setSaved] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data);

        setForm({
          name: data.name || '',
          phone: data.phone || '',
        });

        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);

      setCurrentUser(prev =>
        prev
          ? {
              ...prev,
              name: form.name,
              phone: form.phone,
            }
          : null
      );

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">
        Profil Admin
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* HEADER */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {currentUser?.name?.[0]?.toUpperCase()}
            </div>

            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {currentUser?.name}
            </h3>

            <p className="text-sm text-gray-500">
              Administrator
            </p>

            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>
        </div>

        {/* ALERT */}
        {saved && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <Check className="w-4 h-4" />

            Profil berhasil disimpan!
          </div>
        )}

        {/* FORM */}
        <div className="space-y-4">
          {/* NAMA */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Nama Lengkap
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={form.name}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={currentUser?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-500"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              No. HP
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                value={form.phone}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />

            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}