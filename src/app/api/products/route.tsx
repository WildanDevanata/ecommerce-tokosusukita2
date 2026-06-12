import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================= GET PRODUCTS =================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const isAdmin = searchParams.get('admin') === 'true';
    
    // Tambahkan flag khusus jika dipanggil dari halaman depan / komponen NewProducts
    const isNewArrival = searchParams.get('newArrival') === 'true';

    const products = await prisma.product.findMany({
      where: {
        // customer hanya lihat produk aktif
        ...(isAdmin ? {} : { isActive: true }),

        // filter kategori
        ...(category
          ? {
              category: {
                slug: category,
              },
            }
          : {}),
      },
      include: {
        category: true,
        reviews: true, // 🚀 Ambil data review pembeli
        orderItems: {  // 🚀 Ambil data transaksi item untuk hitung total terjual dinamis
          where: {
            order: {
              paymentStatus: 'PAID', // Hanya hitung jika order sudah lunas/dibayar
            },
          },
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Jika request dari NewProducts, batasi hanya ambil maksimal 4 item
      ...(isNewArrival ? { take: 4 } : {}),
    });

    //Format ulang data agar menyertakan rating desimal & total terjual riil pembeli
    const formattedProducts = products.map((product) => {
      // 1. Hitung rata-rata rating desimal
      const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
      const avgRating = product.reviews.length 
        ? parseFloat((totalRating / product.reviews.length).toFixed(1)) 
        : 0;

      // 2. Hitung total kuantitas produk yang terjual dari order riil pembeli
      const totalSoldReal = product.orderItems.reduce((acc, item) => acc + item.quantity, 0);

      // Destructuring untuk memisahkan internal relations (agar response bersih)
      const { reviews, orderItems, category: catData, ...restProduct } = product;

      return {
        ...restProduct,
        categoryName: catData?.name || '',
        category: catData,
        rating: avgRating,
        reviewCount: reviews.length,
        soldCount: totalSoldReal, // Mengganti total sold dengan kalkulasi riil pesanan pembeli
        isNew: product.isNew ?? true, // Fallback jika field belum ada
        isBestSeller: product.isBestSeller ?? false,
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil produk' },
      { status: 500 }
    );
  }
}

// ================= CREATE PRODUCT =================

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const newProduct =
      await prisma.product.create({
        data: {
          name: body.name,

          slug: body.name
            .toLowerCase()
            .replace(
              /\s+/g,
              '-'
            )
            .replace(
              /[^\w-]+/g,
              ''
            ),

          price: Number(
            body.price
          ),

          originalPrice:
            body.originalPrice
              ? Number(
                  body.originalPrice
                )
              : null,

          stock: Number(
            body.stock || 0
          ),

          weight: Number(
            body.weight || 0
          ),

          image:
            body.image || null,

          description:
            body.description ||
            '',

          isActive:
            body.isActive ??
            true,

          isFeatured:
            body.isFeatured ??
            false,

          bgColor:
            body.bgColor ||
            'bg-blue-100',

          categoryId:
            body.categoryId,
        },

        include: {
          category: true,
        },
      });

    return NextResponse.json(
      newProduct
    );
  } catch (error) {
    console.error(
      'CREATE PRODUCT ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Gagal menambahkan produk',
      },
      {
        status: 500,
      }
    );
  }
}