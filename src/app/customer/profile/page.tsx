'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Plus,
  Trash2,
  Edit3,
  Camera,
 Check,
} from 'lucide-react';

import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';
import { useApp } from '@/store/appcontext';

// ================= TYPES =================

type Address = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};

export default function ProfilePage() {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'address' | 'security'
  >('profile');

  const [editMode, setEditMode] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
  });

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [showAddAddr, setShowAddAddr] =
    useState(false);

  const [addrForm, setAddrForm] =
    useState<Partial<Address>>({
      label: 'Rumah',
      isDefault: false,
    });

  // ================= HANDLERS =================

  const handleSaveProfile = () => {
    // nanti sambungkan ke API / context update user

    setEditMode(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleAddAddress = () => {
    if (
      !addrForm.address ||
      !addrForm.city
    )
      return;

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label:
        addrForm.label || 'Rumah',
      recipientName:
        addrForm.recipientName ||
        currentUser?.name ||
        '',
      phone:
        addrForm.phone ||
        currentUser?.phone ||
        '',
      address: addrForm.address || '',
      city: addrForm.city || '',
      province:
        addrForm.province || '',
      postalCode:
        addrForm.postalCode || '',
      isDefault:
        addresses.length === 0,
    };

    setAddresses((prev) => [
      ...prev,
      newAddr,
    ]);

    setShowAddAddr(false);

    setAddrForm({
      label: 'Rumah',
      isDefault: false,
    });
  };

  // ================= TABS =================

  const tabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
    },
    {
      id: 'address',
      label: 'Alamat',
      icon: MapPin,
    },
    {
      id: 'security',
      label: 'Keamanan',
      icon: Lock,
    },
  ] as const;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="text-sm text-gray-500">
              <Link
                href="/"
                className="hover:text-blue-600"
              >
                Beranda
              </Link>

              <span className="mx-2">/</span>

              <span className="text-gray-800">
                Profil Saya
              </span>
            </nav>

            <h1 className="text-3xl font-black text-gray-800 mt-3">
              Profil Saya
            </h1>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm sticky top-24">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black">
                      {currentUser?.name?.[0]?.toUpperCase() ||
                        'U'}
                    </div>

                    <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-105 transition-all">
                      <Camera className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <h2 className="font-bold text-lg mt-4">
                    {currentUser?.name}
                  </h2>

                  <p className="text-blue-100 text-sm">
                    {currentUser?.role ===
                    'ADMIN'
                      ? 'Administrator'
                      : 'Pelanggan'}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="p-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        onClick={() =>
                          setActiveTab(tab.id)
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">
                        Informasi Profil
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        Kelola informasi akun Anda
                      </p>
                    </div>

                    {!editMode ? (
                      <button
                        onClick={() =>
                          setEditMode(true)
                        }
                        className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl font-semibold hover:bg-blue-100 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditMode(false)
                          }
                          className="px-4 py-2 rounded-2xl text-gray-600 hover:bg-gray-100"
                        >
                          Batal
                        </button>

                        <button
                          onClick={
                            handleSaveProfile
                          }
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4" />
                          Simpan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Alert */}
                  {saved && (
                    <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl">
                      <Check className="w-4 h-4" />
                      Profil berhasil disimpan
                    </div>
                  )}

                  {/* Form */}
                  <div className="space-y-5">
                    {[
                      {
                        label:
                          'Nama Lengkap',
                        field: 'name',
                        type: 'text',
                        value: form.name,
                        icon: User,
                      },
                      {
                        label: 'Email',
                        field: 'email',
                        type: 'email',
                        value:
                          currentUser?.email ||
                          '',
                        icon: Mail,
                        disabled: true,
                      },
                      {
                        label:
                          'Nomor WhatsApp',
                        field: 'phone',
                        type: 'tel',
                        value: form.phone,
                        icon: Phone,
                      },
                    ].map((field) => {
                      const Icon =
                        field.icon;

                      return (
                        <div
                          key={field.field}
                        >
                          <label className="text-sm font-semibold text-gray-700 block mb-2">
                            {field.label}
                          </label>

                          <div className="relative">
                            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                              type={
                                field.type
                              }
                              value={
                                field.value
                              }
                              disabled={
                                !editMode ||
                                field.disabled
                              }
                              onChange={(e) =>
                                setForm(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    [
                                      field.field
                                    ]:
                                      e.target
                                        .value,
                                  })
                                )
                              }
                              className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm transition-all ${
                                !editMode ||
                                field.disabled
                                  ? 'bg-gray-50 border-gray-100 text-gray-500'
                                  : 'border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <p className="text-sm text-gray-500">
                        Bergabung Sejak
                      </p>

                      <h4 className="font-bold text-gray-800 mt-1">
                        {currentUser?.createdAt ||
                          '-'}
                      </h4>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5">
                      <p className="text-sm text-gray-500">
                        Status Akun
                      </p>

                      <h4 className="font-bold text-green-600 mt-1">
                        Aktif
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {/* ADDRESS TAB */}
              {activeTab === 'address' && (
                <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-800">
                        Alamat Pengiriman
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Kelola alamat
                        pengiriman Anda
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setShowAddAddr(true)
                      }
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-2xl hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Alamat
                    </button>
                  </div>

                  {/* Address List */}
                  {addresses.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="text-6xl mb-4">
                        📍
                      </div>

                      <h3 className="text-xl font-bold text-gray-700">
                        Belum Ada Alamat
                      </h3>

                      <p className="text-gray-400 mt-2">
                        Tambahkan alamat
                        pengiriman baru
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map(
                        (addr) => (
                          <div
                            key={addr.id}
                            className={`rounded-3xl border p-5 ${
                              addr.isDefault
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                                    {
                                      addr.label
                                    }
                                  </span>

                                  {addr.isDefault && (
                                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                      Utama
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-bold text-gray-800">
                                  {
                                    addr.recipientName
                                  }
                                </h4>

                                <p className="text-sm text-gray-500 mt-1">
                                  {
                                    addr.phone
                                  }
                                </p>

                                <p className="text-sm text-gray-600 mt-2">
                                  {
                                    addr.address
                                  }
                                  , {addr.city},{' '}
                                  {
                                    addr.province
                                  }{' '}
                                  {
                                    addr.postalCode
                                  }
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  setAddresses(
                                    (
                                      prev
                                    ) =>
                                      prev.filter(
                                        (
                                          a
                                        ) =>
                                          a.id !==
                                          addr.id
                                      )
                                  )
                                }
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Add Form */}
                  {showAddAddr && (
                    <div className="mt-8 border border-gray-200 rounded-3xl p-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-5">
                        Tambah Alamat
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          'recipientName',
                          'phone',
                          'address',
                          'city',
                          'province',
                          'postalCode',
                        ].map((field) => (
                          <input
                            key={field}
                            type="text"
                            placeholder={
                              field
                            }
                            value={
                              (
                                addrForm as any
                              )[field] ||
                              ''
                            }
                            onChange={(
                              e
                            ) =>
                              setAddrForm(
                                (
                                  prev
                                ) => ({
                                  ...prev,
                                  [field]:
                                    e
                                      .target
                                      .value,
                                })
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ))}
                      </div>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() =>
                            setShowAddAddr(
                              false
                            )
                          }
                          className="flex-1 border border-gray-200 py-3 rounded-2xl hover:bg-gray-50"
                        >
                          Batal
                        </button>

                        <button
                          onClick={
                            handleAddAddress
                          }
                          className="flex-1 bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-2xl font-black text-gray-800 mb-6">
                      Ubah Password
                    </h3>

                    <div className="space-y-4">
                      {[
                        'Password Lama',
                        'Password Baru',
                        'Konfirmasi Password',
                      ].map((label) => (
                        <div key={label}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {label}
                          </label>

                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      ))}

                      <button className="w-full bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition-all">
                        Simpan Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-[32px] p-8">
                    <h3 className="text-xl font-black text-red-700 mb-2">
                      Hapus Akun
                    </h3>

                    <p className="text-sm text-red-600 mb-5">
                      Semua data akun akan
                      dihapus permanen dan
                      tidak dapat
                      dikembalikan.
                    </p>

                    <button className="border border-red-500 text-red-500 px-5 py-3 rounded-2xl hover:bg-red-100 transition-all">
                      Hapus Akun Saya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}