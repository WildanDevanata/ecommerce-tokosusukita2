import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/detailproducts/breadcrumb";
import { ProductImage } from "@/components/detailproducts/productimage";
import { ProductDetailsContainer } from "@/app/products/[slug]/product-details-container";
import { ProductTabs } from "@/components/detailproducts/producttabs";
import { ProductCard } from "@/components/detailproducts/productcard";
import Navbar from "@/components/sharing/navbar";
import Footer from "@/components/sharing/footer";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // AMBIL DATA ASLI DARI DATABASE + INCLUDE REVIEWS & USERNYA
  const product = await prisma.product.findUnique({
    where: { slug: slug },
    include: { 
      category: true,
      reviews: {
        include: {
          user: {
            select: { name: true } // Hanya ambil nama user pembeli demi privasi
          }
        },
        orderBy: {
          createdAt: 'desc' // Urutkan dari ulasan terbaru
        }
      }
    }
  });

  if (!product) notFound();

  // Ambil produk terkait berdasarkan kategori yang sama
  const relatedProducts = await prisma.product.findMany({
    where: { 
      // Silakan aktifkan kembali baris di bawah jika ingin filter kategori berfungsi
      // categoryId: product.categoryId, 
      NOT: { id: product.id },
      isActive: true // Pastikan produk aktif
    },
    take: 4,
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumb 
            categoryId={product.categoryId} 
            categoryName={product.category?.name} 
            productName={product.name} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <ProductImage 
              imagePath={product.image || '📦'} 
              bgColor={product.bgColor || 'bg-blue-100'} 
              price={product.price}
              originalPrice={product.originalPrice || undefined}
            />

            <ProductDetailsContainer product={product} />
          </div>

          {/* KIRIM DATA PRODUCT DAN REVIEWS NYA KE SINI */}
          <ProductTabs product={product} reviews={product.reviews} />

          {/* RELATED PRODUCTS SECTION */}
          <section className="mt-16">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Produk Terkait</h2>
            {relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} /> 
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Tidak ada produk terkait ditemukan.</p>
            )}
          </section>
          
        </div>
      </div>
      <Footer />
    </>
  );
}