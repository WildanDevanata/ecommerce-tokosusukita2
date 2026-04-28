import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isNew: true 
      },
      include: { category: true },
      take: 8 // Kita ambil 8 produk terbaru saja untuk landing page
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil produk baru" }, { status: 500 });
  }
}