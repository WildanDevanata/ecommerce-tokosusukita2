import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import AppProvider dari file yang kita buat tadi
import { AppProvider } from "@/store/appcontext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SusuKita - Toko Susu & Perlengkapan Bayi",
  description: "Solusi kebutuhan si kecil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* SEMUA children (termasuk page products) harus di dalam sini */}
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}