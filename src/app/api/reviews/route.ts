import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ========================================================
// 1. FUNGSI POST (Sudah benar milikmu, dipertahankan)
// ========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderItemId, productId, userId, rating, comment, image } = body;

    if (!orderItemId || !productId || !userId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { orderItemId: orderItemId }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Item pesanan ini sudah pernah diulas.' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || null,
        image: image || null,
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

// ========================================================
// 2. FUNGSI GET (💡 TAMBAHKAN / PERBAIKI BLOK INI)
// ========================================================
export async function GET(req: Request) {
  try {
    // Mengambil query params dari URL (contoh: /api/reviews?orderId=ORD-2024-001)
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId'); // atau sesuaikan jika kamu pakai internal id database

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID diperlukan' }, { status: 400 });
    }

    // Mengambil data OrderItem berdasarkan OrderID, sekaligus menyertakan (include) data Review dan Product
    const orderItemsWithReviews = await prisma.orderItem.findMany({
      where: {
        // Jika di database kolomnya bernama orderId, pastikan relasinya tepat
        orderId: orderId 
      },
      include: {
        product: {
          select: {
            name: true,
            image: true
          }
        },
        // KUNCI UTAMA: Menyertakan relasi review ke dalam orderItem
        review: true 
      }
    });

    // Melakukan transformasi data agar struktur array-nya instan dibaca oleh frontend
    const formattedData = orderItemsWithReviews.map((item) => ({
      id: item.id,
      productName: item.product?.name || "Produk Tanpa Nama",
      image: item.product?.image || null,
      // Menyertakan objek review asli dari database (rating, comment, id, dll)
      review: item.review ? {
        id: item.review.id,
        rating: item.review.rating,
        comment: item.review.comment,
        image: item.review.image
      } : null
    }));

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: error.message || 'Gagal mengambil data ulasan' }, { status: 500 });
  }
}