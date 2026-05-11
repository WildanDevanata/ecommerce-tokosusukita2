'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();

        const validatedData = Array.isArray(data)
          ? data
          : (data.categories || data.data || []);

        setCategories(validatedData);
      } catch (error) {
        console.error(
          'Error fetching categories:',
          error
        );

        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    getCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        Memuat kategori...
      </div>
    );
  }

  if (categories.length === 0)
    return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Kategori Pilihan
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-blue-100"
            >
              <div
                className={`w-16 h-16 ${
                  cat.bgColor ||
                  'bg-blue-50'
                } rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>

              <span className="font-semibold text-gray-800 text-sm text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}