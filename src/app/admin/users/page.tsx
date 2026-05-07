'use client';

import { useEffect, useState } from 'react';

import {
  Search,
  Shield,
  User,
  ToggleLeft,
  ToggleRight,
  Eye,
  X,
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

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const filtered = users.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      filterRole === 'ALL' || user.role === filterRole;

    return matchSearch && matchRole;
  });

  const toggleStatus = async (id: string) => {
    const target = users.find(u => u.id === id);

    if (!target) return;

    const updated = !target.isActive;

    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isActive: updated,
      }),
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, isActive: updated }
          : u
      )
    );
  };

  const toggleRole = async (id: string) => {
    const target = users.find(u => u.id === id);

    if (!target) return;

    const updatedRole =
      target.role === 'ADMIN'
        ? 'CUSTOMER'
        : 'ADMIN';

    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: updatedRole,
      }),
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, role: updatedRole }
          : u
      )
    );
  };

  const totalAdmins = users.filter(
    u => u.role === 'ADMIN'
  ).length;

  const totalCustomers = users.filter(
    u => u.role === 'CUSTOMER'
  ).length;

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Pengguna
        </h1>

        <p className="text-sm text-gray-500">
          {users.length} pengguna terdaftar
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-sm text-blue-600">
            Total Pengguna
          </p>

          <h3 className="text-2xl font-bold text-blue-700">
            {users.length}
          </h3>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4">
          <p className="text-sm text-purple-600">
            Administrator
          </p>

          <h3 className="text-2xl font-bold text-purple-700">
            {totalAdmins}
          </h3>
        </div>

        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-sm text-green-600">
            Customer
          </p>

          <h3 className="text-2xl font-bold text-green-700">
            {totalCustomers}
          </h3>
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
                {[
                  'No',
                  'Pengguna',
                  'Role',
                  'Pesanan',
                  'Status',
                  'Aksi',
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">
                    {i + 1}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {user.name[0]}
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {user.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {user.orderCount}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleStatus(user.id)
                      }
                    >
                      {user.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          toggleRole(user.id)
                        }
                        className="p-2 rounded-lg hover:bg-purple-50 text-purple-600"
                      >
                        {user.role === 'ADMIN' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">
                Detail Pengguna
              </h3>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">
                  Nama
                </p>
                <p>{selectedUser.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Email
                </p>
                <p>{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Bergabung
                </p>
                <p>
                  {formatDate(
                    selectedUser.createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}