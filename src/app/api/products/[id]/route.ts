import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await req.json();

    const updated = await prisma.product.update({
      where: {
        id,
      },

      data: {
        name: body.name,
        price: Number(body.price),

        originalPrice: body.originalPrice
          ? Number(body.originalPrice)
          : null,

        stock: Number(body.stock || 0),
        weight: Number(body.weight || 0),

        emoji: body.emoji,
        description: body.description,

        isActive: body.isActive,
        isFeatured: body.isFeatured,

        categoryId: body.categoryId,
      },

      include: {
        category: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);

    return NextResponse.json(
      { message: 'Gagal update produk' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);

    return NextResponse.json(
      { message: 'Gagal hapus produk' },
      { status: 500 }
    );
  }
}