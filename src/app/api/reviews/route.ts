import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan dengan lokasi init prisma Anda

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderItemId, productId, userId, rating, comment, image } = body;

    if (!orderItemId || !productId || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // 1. Validasi apakah OrderItem ini sudah pernah diulas sebelumnya
    const existingReview = await prisma.review.findUnique({
      where: { orderItemId: orderItemId }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Item pesanan ini sudah pernah diulas.' }, { status: 400 });
    }

    // 2. Simpan data ke database dengan struktur relasi yang benar
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || null,
        image: image || null,
        // Menggunakan koneksi relasi object resmi Prisma
        user: { connect: { id: userId } },
        product: { connect: { id: productId } },
        orderItem: { connect: { id: orderItemId } }
      },
    });

    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Gagal menyimpan ulasan' }, { status: 500 });
  }
}