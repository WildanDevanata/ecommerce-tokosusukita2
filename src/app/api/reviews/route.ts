import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

// ========================================================
// POST REVIEW
// ========================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      orderItemId,
      productId,
      userId,
      rating,
      comment,
      image,
    } = body;

    // ========================================================
    // VALIDASI INPUT
    // ========================================================
    if (!orderItemId || !productId || !userId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // ========================================================
    // CEK REVIEW SUDAH ADA?
    // ========================================================
    const existingReview = await prisma.review.findUnique({
      where: {
        orderItemId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Item pesanan ini sudah pernah diulas.' },
        { status: 400 }
      );
    }

    // ========================================================
    // AMBIL ORDER ITEM & USER INFO (Nested via Order)
    // ========================================================
    const currentOrderItem = await prisma.orderItem.findUnique({
      where: {
        id: orderItemId,
      },
      include: {
        product: true,
        order: {
          include: {
            user: true, // ✅ Relasi user diambil secara nested lewat order
          },
        },
      },
    });

    if (!currentOrderItem) {
      return NextResponse.json(
        { error: 'Order item tidak ditemukan' },
        { status: 404 }
      );
    }

    // ========================================================
    // BUAT REVIEW
    // ========================================================
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment || null,
        image: image || null,

        user: {
          connect: { id: userId },
        },
        product: {
          connect: { id: productId },
        },
        orderItem: {
          connect: { id: orderItemId },
        },
      },
      include: {
        user: true, 
      },
    });

    // ========================================================
    // 🔔 TRIGGER NOTIFIKASI UNTUK ADMIN (DIPERBAIKI)
    // ========================================================
    const reviewerName = 
      newReview.user?.name || 
      currentOrderItem.order?.user?.name || 
      currentOrderItem.order?.shippingRecipient || 
      "Customer";
      
    const productName = currentOrderItem.product?.name || "Produk";

    await prisma.notification.create({
      data: {
        userId: null, // Ditujukan ke Panel Admin
        title: "Ulasan Baru Diterima! ⭐",
        message: `${reviewerName} memberikan rating ${rating} untuk produk "${productName}".`,
        type: "ORDER", // 🔥 PERBAIKAN: Diubah ke "ORDER" agar tidak melanggar batasan Enum Prisma
        link: `/admin/products/${productId}/reviews`, 
      },
    });

    // ========================================================
    // HITUNG TOTAL ITEM & TOTAL REVIEWS DALAM ORDER INI
    // ========================================================
    const totalItems = await prisma.orderItem.count({
      where: {
        orderId: currentOrderItem.orderId,
      },
    });

    const totalReviewed = await prisma.review.count({
      where: {
        orderItem: {
          orderId: currentOrderItem.orderId,
        },
      },
    });

    console.log({
      totalItems,
      totalReviewed,
    });

    // ========================================================
    // JIKA SEMUA ITEM SELESAI DIREVIEW -> UPDATE STATUS ORDER
    // ========================================================
    const allReviewed = totalItems > 0 && totalItems === totalReviewed;

    if (allReviewed) {
      await prisma.order.update({
        where: {
          id: currentOrderItem.orderId,
        },
        data: {
          status: OrderStatus.REVIEWED,
        },
      });

      console.log('ORDER STATUS UPDATED TO REVIEWED');
    }

    return NextResponse.json(
      {
        success: true,
        data: newReview,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('ERROR CREATE REVIEW:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyimpan ulasan' },
      { status: 500 }
    );
  }
}

// ========================================================
// GET REVIEW BY ORDER (Sudah Benar)
// ========================================================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID diperlukan' },
        { status: 400 }
      );
    }

    const orderItemsWithReviews = await prisma.orderItem.findMany({
      where: {
        orderId,
      },
      include: {
        product: {
          select: {
            name: true,
            image: true,
          },
        },
        review: true,
      },
    });

    const formattedData = orderItemsWithReviews.map((item) => ({
      id: item.id,
      productName: item.product?.name || 'Produk Tanpa Nama',
      image: item.product?.image || null,
      review: item.review
        ? {
            id: item.review.id,
            rating: item.review.rating,
            comment: item.review.comment,
            image: item.review.image,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('ERROR FETCH REVIEWS:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data ulasan' },
      { status: 500 }
    );
  }
}