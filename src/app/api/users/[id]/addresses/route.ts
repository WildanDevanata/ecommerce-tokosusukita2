import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Tipe params sekarang harus dibungkus dalam Promise untuk Next.js terbaru
type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: Props
) {
  try {
    // 1. Ambil data dari body request
    const body = await req.json();

    // 2. Unwrapping params (Penting!)
    const { id } = await params;

    // 3. Simpan ke database menggunakan Prisma
    const address = await prisma.address.create({
      data: {
        userId: id, // Menggunakan id yang sudah di-await
        label: body.label,
        recipientName: body.recipientName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        isDefault: body.isDefault || false, // Default ke false jika kosong
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error detail:", error);

    return NextResponse.json(
      {
        message: 'Gagal tambah alamat',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}