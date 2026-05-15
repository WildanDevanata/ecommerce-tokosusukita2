// app/api/categories/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ================= GET ALL CATEGORIES =================

export async function GET() {
  try {
    // ambil categories
    const categories =
      await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });

    // ambil hanya produk aktif
    const products =
      await prisma.product.findMany({
        where: {
          isActive: true,
        },

        select: {
          id: true,
          categoryId: true,
        },
      });

    // hitung manual jumlah produk aktif
    const formattedCategories =
      categories.map((cat) => {
        const productCount =
          products.filter(
            (p) =>
              p.categoryId ===
              cat.id
          ).length;

        return {
          id: cat.id,

          name: cat.name,

          slug: cat.slug,

          icon:
            cat.icon || '📦',

          description:
            cat.description ||
            '',

          color:
            cat.color ||
            'text-blue-600',

          bgColor:
            cat.bgColor ||
            'bg-blue-50',

          // realtime active count
          productCount,
        };
      });

    return NextResponse.json(
      formattedCategories
    );
  } catch (error) {
    console.error(
      'API Categories Error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Gagal mengambil kategori',
      },
      {
        status: 500,
      }
    );
  }
}

// ================= CREATE CATEGORY =================

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    // ================= VALIDATION =================

    if (!body.name) {
      return NextResponse.json(
        {
          error:
            'Nama kategori wajib diisi',
        },
        {
          status: 400,
        }
      );
    }

    // ================= CHECK DUPLICATE SLUG =================

    const existingCategory =
      await prisma.category.findUnique(
        {
          where: {
            slug: body.slug,
          },
        }
      );

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            'Kategori dengan slug tersebut sudah ada',
        },
        {
          status: 400,
        }
      );
    }

    // ================= CREATE CATEGORY =================

    const category =
      await prisma.category.create({
        data: {
          name: body.name,

          slug: body.slug,

          icon:
            body.icon || '📦',

          description:
            body.description ||
            '',

          color:
            body.color ||
            'text-blue-600',

          bgColor:
            body.bgColor ||
            'bg-blue-50',
        },
      });

    // ================= FORMAT RESPONSE =================

    const formattedCategory =
      {
        id: category.id,

        name: category.name,

        slug: category.slug,

        icon:
          category.icon ||
          '📦',

        description:
          category.description ||
          '',

        color:
          category.color ||
          'text-blue-600',

        bgColor:
          category.bgColor ||
          'bg-blue-50',

        // kategori baru pasti 0
        productCount: 0,
      };

    return NextResponse.json(
      formattedCategory,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      'CREATE CATEGORY ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Gagal membuat kategori',
      },
      {
        status: 500,
      }
    );
  }
}