import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================= UPDATE PRODUCT =================

export async function PATCH(
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

    // ================= DYNAMIC UPDATE =================

    const updateData: any = {};

    // hanya update field yg dikirim

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.slug !== undefined) {
      updateData.slug = body.slug;
    }

    if (body.price !== undefined) {
      updateData.price =
        Number(body.price);
    }

    if (
      body.originalPrice !==
      undefined
    ) {
      updateData.originalPrice =
        body.originalPrice
          ? Number(
              body.originalPrice
            )
          : null;
    }

    if (body.stock !== undefined) {
      updateData.stock =
        Number(body.stock);
    }

    if (body.weight !== undefined) {
      updateData.weight =
        Number(body.weight);
    }

    if (
      body.emoji !== undefined
    ) {
      updateData.emoji =
        body.emoji;
    }

    if (
      body.description !==
      undefined
    ) {
      updateData.description =
        body.description;
    }

    if (
      body.isActive !==
      undefined
    ) {
      updateData.isActive =
        body.isActive;
    }

    if (
      body.isFeatured !==
      undefined
    ) {
      updateData.isFeatured =
        body.isFeatured;
    }

    if (
      body.categoryId !==
      undefined
    ) {
      updateData.categoryId =
        body.categoryId;
    }

    // ================= UPDATE =================

    const updated =
      await prisma.product.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          category: true,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(
      'UPDATE PRODUCT ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Gagal update produk',
      },
      {
        status: 500,
      }
    );
  }
}

// ================= DELETE PRODUCT =================

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

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      'DELETE PRODUCT ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Gagal hapus produk',
      },
      {
        status: 500,
      }
    );
  }
}