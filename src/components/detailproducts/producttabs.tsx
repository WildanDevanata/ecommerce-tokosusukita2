'use client';
import { useState } from 'react';

// Definisikan tipe data yang diekspektasikan dari Prisma
interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  user?: {
    name: string | null;
  };
}

interface ProductTabsProps {
  product: {
    description: string | null;
    stock: number;
    category?: {
      name: string;
    } | null;
  };
  reviews: ReviewWithUser[];
}

export const ProductTabs = ({ product, reviews = [] }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState('desc');

  const tabs = [
    { id: 'desc', label: 'Deskripsi' },
    { id: 'spec', label: 'Spesifikasi' },
    { id: 'reviews', label: 'Ulasan' }
  ];

  // Menghitung statistik berdasarkan data riil dari DB
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 
      ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 
      : 0
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 font-semibold' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.id === 'reviews' && totalReviews > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">
                {totalReviews}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* DESKRIPSI */}
        {activeTab === 'desc' && (
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="whitespace-pre-line">{product.description || 'Tidak ada deskripsi produk.'}</p>
          </div>
        )}

        {/* SPESIFIKASI */}
        {activeTab === 'spec' && (
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-100">
                   <tr><td className="py-3 text-gray-500 w-40 font-medium">Kategori</td><td className="py-3 text-gray-800">{product.category?.name || 'Umum'}</td></tr>
                   <tr><td className="py-3 text-gray-500 font-medium">Stok</td><td className="py-3 text-gray-800">{product.stock} Unit</td></tr>
                </tbody>
             </table>
          </div>
        )}

        {/* ULASAN DARI DB */}
        {activeTab === 'reviews' && (
          <div>
            {totalReviews === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Belum ada ulasan untuk produk ini.
              </div>
            ) : (
              <div className="space-y-8">
                {/* Ringkasan Skor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100 items-center">
                  <div className="text-center md:border-r md:border-gray-200">
                    <div className="text-5xl font-bold text-gray-800">{averageRating}</div>
                    <div className="text-sm text-gray-500 mt-1">dari 5 bintang</div>
                    <div className="flex justify-center gap-0.5 mt-2 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < Math.round(Number(averageRating)) ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">({totalReviews} Ulasan terverifikasi)</div>
                  </div>

                  {/* Batang Statistik */}
                  <div className="col-span-2 space-y-2">
                    {ratingCounts.map(item => (
                      <div key={item.stars} className="flex items-center gap-3 text-sm">
                        <span className="w-3 text-gray-500 font-medium">{item.stars}</span>
                        <span className="text-amber-400 text-xs">★</span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-gray-400">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daftar Iterasi Feedback Pelanggan */}
                <div className="divide-y divide-gray-100">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">
                            {rev.user?.name || `Pelanggan #${rev.userId.slice(-4)}`}
                          </h4>
                          <div className="flex gap-0.5 text-amber-400 text-xs mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">Transaksi Terverifikasi</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-50 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};