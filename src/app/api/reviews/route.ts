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
    // VALIDASI
    // ========================================================
    if (
      !orderItemId ||
      !productId ||
      !userId
    ) {
      return NextResponse.json(
        {
          error: 'Data tidak lengkap',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CEK REVIEW SUDAH ADA?
    // ========================================================
    const existingReview =
      await prisma.review.findUnique({
        where: {
          orderItemId,
        },
      });

    if (existingReview) {
      return NextResponse.json(
        {
          error:
            'Item pesanan ini sudah pernah diulas.',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // AMBIL ORDER ITEM
    // ========================================================
    const currentOrderItem =
      await prisma.orderItem.findUnique({
        where: {
          id: orderItemId,
        },

        include: {
          order: true,
        },
      });

    if (!currentOrderItem) {
      return NextResponse.json(
        {
          error:
            'Order item tidak ditemukan',
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // BUAT REVIEW
    // ========================================================
    const newReview =
      await prisma.review.create({
        data: {
          rating: Number(rating),
          comment: comment || null,
          image: image || null,

          user: {
            connect: {
              id: userId,
            },
          },

          product: {
            connect: {
              id: productId,
            },
          },

          orderItem: {
            connect: {
              id: orderItemId,
            },
          },
        },
      });

    // ========================================================
    // TOTAL ITEM DALAM ORDER
    // ========================================================
    const totalItems =
      await prisma.orderItem.count({
        where: {
          orderId:
            currentOrderItem.orderId,
        },
      });

    // ========================================================
    // TOTAL REVIEW DALAM ORDER
    // ========================================================
    const totalReviewed =
      await prisma.review.count({
        where: {
          orderItem: {
            orderId:
              currentOrderItem.orderId,
          },
        },
      });

    console.log({
      totalItems,
      totalReviewed,
    });

    // ========================================================
    // JIKA SEMUA ITEM SUDAH DIREVIEW
    // ========================================================
    const allReviewed =
      totalItems > 0 &&
      totalItems === totalReviewed;

    if (allReviewed) {

      await prisma.order.update({
        where: {
          id: currentOrderItem.orderId,
        },

        data: {
          status:
            OrderStatus.REVIEWED,
        },
      });

      console.log(
        'ORDER UPDATED TO REVIEWED'
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newReview,
      },
      {
        status: 201,
      }
    );

  } catch (error: any) {

    console.error(
      'ERROR CREATE REVIEW:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Gagal menyimpan ulasan',
      },
      {
        status: 500,
      }
    );
  }
}

// ========================================================
// GET REVIEW BY ORDER
// ========================================================
export async function GET(req: Request) {
  try {

    // ========================================================
    // AMBIL QUERY PARAM
    // ========================================================
    const { searchParams } =
      new URL(req.url);

    const orderId =
      searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            'Order ID diperlukan',
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // AMBIL ORDER ITEMS + REVIEW
    // ========================================================
    // ========================================================
// AUTO UPDATE STATUS ORDER
// ========================================================

if (currentOrderItem?.orderId) {

  // AMBIL SEMUA ITEM DALAM ORDER
  const orderItems =
    await prisma.orderItem.findMany({
      where: {
        orderId: currentOrderItem.orderId,
      },

      include: {
        review: true,
      },
    });

  console.log(
    'CHECK ORDER ITEMS:',
    orderItems.map((item) => ({
      id: item.id,
      hasReview: item.review !== null,
    }))
  );

  // CEK APAKAH SEMUA ITEM SUDAH DIREVIEW
  const allReviewed =
    orderItems.length > 0 &&
    orderItems.every(
      (item) => item.review !== null
    );

  console.log(
    'ALL REVIEWED:',
    allReviewed
  );

  // UPDATE STATUS ORDER
  if (allReviewed) {

    await prisma.order.update({
      where: {
        id: currentOrderItem.orderId,
      },

      data: {
        status: OrderStatus.REVIEWED,
      },
    });

    console.log(
      'ORDER UPDATED TO REVIEWED'
    );
  }
}

    // ========================================================
    // FORMAT RESPONSE
    // ========================================================
    const formattedData =
      orderItemsWithReviews.map(
        (item) => ({
          id: item.id,

          productName:
            item.product?.name ||
            'Produk Tanpa Nama',

          image:
            item.product?.image ||
            null,

          review: item.review
            ? {
                id: item.review.id,

                rating:
                  item.review.rating,

                comment:
                  item.review.comment,

                image:
                  item.review.image,
              }
            : null,
        })
      );

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {

    console.error(
      'ERROR FETCH REVIEWS:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Gagal mengambil data ulasan',
      },
      {
        status: 500,
      }
    );
  }
}