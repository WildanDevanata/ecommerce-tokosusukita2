import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/store/appcontext";

const inter = Inter({
  subsets: ["latin"],
});

// ================= PERBAIKAN METADATA & ICONS =================
export const metadata: Metadata = {
  title: "SusuKita2- Toko Susu & Perlengkapan Bayi",
  description: "Solusi kebutuhan si kecil",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>🍼</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={inter.className}
        suppressHydrationWarning
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}