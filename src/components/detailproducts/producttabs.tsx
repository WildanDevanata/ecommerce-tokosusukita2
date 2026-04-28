// components/products/ProductTabs.tsx
'use client';
import { useState } from 'react';

export const ProductTabs = ({ product }: { product: any }) => {
  const [activeTab, setActiveTab] = useState('desc');

  const tabs = [
    { id: 'desc', label: 'Deskripsi' },
    { id: 'spec', label: 'Spesifikasi' },
    { id: 'reviews', label: 'Ulasan' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">
        {activeTab === 'desc' && (
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        )}
        {activeTab === 'spec' && (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100">
                   <tr><td className="py-3 text-gray-500 w-40 font-medium">Kategori</td><td className="py-3 text-gray-800">{product.category?.name}</td></tr>
                   <tr><td className="py-3 text-gray-500 font-medium">Stok</td><td className="py-3 text-gray-800">{product.stock} Unit</td></tr>
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};