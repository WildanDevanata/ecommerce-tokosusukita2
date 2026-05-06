import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }, // Menghitung jumlah produk per kategori
        },
      },
    });

    // Kita transform datanya agar frontend menerima property 'productCount'
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description, // Tambahkan baris ini
      color: cat.color || 'text-blue-600',
      bgColor: cat.bgColor || 'bg-blue-50',
      // Mengambil hasil count dari Prisma
      productCount: cat._count.products,
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("API Categories Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori" },
      { status: 500 }
    );
  }
}