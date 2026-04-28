import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isBestSeller: true 
      },
      include: { category: true },
      orderBy: { soldCount: 'desc' }, // Urutkan dari yang paling laku
      take: 8 
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil produk terlaris" }, { status: 500 });
  }
}