import AboutHero from "@/components/about/hero";
import AboutStory from "@/components/about/story";
import AboutStats from "@/components/about/stats";
import AboutVision from "@/components/about/visi";
import Navbar from "@/components/sharing/navbar";
import Footer from "@/components/sharing/footer";
import AboutCTA from "@/components/about/CTA";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50">
        {/* Section Hero (Full Width) */}
        <AboutHero />
        
        {/* Container untuk konten dengan padding samping yang konsisten */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-16">
            <AboutStory />
            <AboutStats />
            <AboutVision />
            <AboutCTA />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}