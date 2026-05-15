import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================= GET PRODUCTS =================

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const category =
      searchParams.get(
        'category'
      );

    // cek apakah request dari admin
    const isAdmin =
      searchParams.get(
        'admin'
      ) === 'true';

    const products =
      await prisma.product.findMany({
        where: {
          // customer hanya lihat produk aktif
          ...(isAdmin
            ? {}
            : {
                isActive: true,
              }),

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
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return NextResponse.json(
      products
    );
  } catch (error) {
    console.error(
      'GET PRODUCTS ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Gagal mengambil produk',
      },
      {
        status: 500,
      }
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