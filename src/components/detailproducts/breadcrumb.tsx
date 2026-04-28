// components/products/Breadcrumb.tsx
import Link from 'next/link';

export const Breadcrumb = ({ categoryName, productName, categoryId }: any) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
    <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
    <span>/</span>
    <Link href="/products" className="hover:text-blue-600 transition-colors">Produk</Link>
    <span>/</span>
    <Link href={`/products?category=${categoryId}`} className="hover:text-blue-600 transition-colors">{categoryName}</Link>
    <span>/</span>
    <span className="text-gray-800 truncate max-w-xs font-medium">{productName}</span>
  </nav>
);