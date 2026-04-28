import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Logic: Jika ada param category, filter di database. Jika tidak, ambil semua.
    const products = await prisma.product.findMany({
      where: category ? {
        category: {
          slug: category // Asumsi di schema Prisma kamu ada relasi category
        }
      } : {},
      include: {
        category: true // Agar data kategori (nama, icon) ikut terbawa
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data produk" }, 
      { status: 500 }
    );
  }
}