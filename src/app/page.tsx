'use client';
import { prisma } from "@/lib/prisma";

import Navbar from "@/components/sharing/navbar";
import Footer from "@/components/sharing/footer";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import CategoriesSection from "@/components/landing/categories";
import NewProducts from "@/components/landing/newproducts";
import Bestseller from "@/components/landing/bestseller";
import PromoBanner from "@/components/landing/promobanner";
import WhyChooseUs from "@/components/landing/whychooseus";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Bagian Atas / Visual Utama */}
        <Hero />
        <Features />

        {/* Bagian Kategori - Sekarang Fetch Data Sendiri */}
        <CategoriesSection />
        <NewProducts />
        <Bestseller />  
        {/* Banner Promosi Tengah */}
        <PromoBanner />

        {/* Bagian Produk Terlaris - Sekarang Fetch Data Sendiri */}
        

        {/* Nilai Jual / Trust Builder */}
        <WhyChooseUs />
      </main>
      <Footer />
    </>
  );
}