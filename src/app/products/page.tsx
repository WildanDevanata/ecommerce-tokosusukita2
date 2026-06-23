import { Suspense } from 'react';
import ProductsClient from '@/components/products/ProductsClient';
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Suspense fallback={<div className="text-center py-10">Memuat produk...</div>}>
            <ProductsClient />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}