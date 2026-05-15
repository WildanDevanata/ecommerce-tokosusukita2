// app/api/categories/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ================= UPDATE CATEGORY =================

export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const body = await req.json();

    // validasi
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

    // cek kategori ada atau tidak
    const existingCategory =
      await prisma.category.findUnique(
        {
          where: { id },
        }
      );

    if (!existingCategory) {
      return NextResponse.json(
        {
          error:
            'Kategori tidak ditemukan',
        },
        {
          status: 404,
        }
      );
    }

    // cek slug duplicate
    const duplicateSlug =
      await prisma.category.findFirst(
        {
          where: {
            slug: body.slug,
            NOT: {
              id,
            },
          },
        }
      );

    if (duplicateSlug) {
      return NextResponse.json(
        {
          error:
            'Slug sudah digunakan kategori lain',
        },
        {
          status: 400,
        }
      );
    }

    // update category
    const updatedCategory =
      await prisma.category.update({
        where: { id },

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

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    // format response
    const formattedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      icon: updatedCategory.icon,
      description:
        updatedCategory.description,
      color:
        updatedCategory.color ||
        'text-blue-600',
      bgColor:
        updatedCategory.bgColor ||
        'bg-blue-50',

      // jumlah produk realtime
      productCount:
        updatedCategory._count
          .products,
    };

    return NextResponse.json(
      formattedCategory
    );
  } catch (error) {
    console.error(
      'UPDATE CATEGORY ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Gagal update kategori',
      },
      {
        status: 500,
      }
    );
  }
}

// ================= DELETE CATEGORY =================

export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    // cek kategori ada atau tidak
    const existingCategory =
      await prisma.category.findUnique(
        {
          where: { id },

          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        }
      );

    if (!existingCategory) {
      return NextResponse.json(
        {
          error:
            'Kategori tidak ditemukan',
        },
        {
          status: 404,
        }
      );
    }

    // cegah hapus jika masih ada produk
    if (
      existingCategory._count
        .products > 0
    ) {
      return NextResponse.json(
        {
          error:
            'Kategori tidak bisa dihapus karena masih memiliki produk',
        },
        {
          status: 400,
        }
      );
    }

    // delete category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        'Kategori berhasil dihapus',
    });
  } catch (error) {
    console.error(
      'DELETE CATEGORY ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Gagal menghapus kategori',
      },
      {
        status: 500,
      }
    );
  }
}