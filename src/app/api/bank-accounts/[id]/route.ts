import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    // WAJIB await params di Next.js terbaru
    const params =
      await context.params;

    const id = params.id;

    const body =
      await req.json();

    // Hapus field yg tidak boleh diupdate
    const {
      id: _id,
      createdAt,
      updatedAt,
      ...updateData
    } = body;

    const updated =
      await prisma.bankAccount.update(
        {
          where: { id },

          data: updateData,
        }
      );

    return NextResponse.json(
      updated
    );
  } catch (error: any) {
    console.error(
      'PATCH_ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: any
) {
  try {
    // WAJIB await params
    const params =
      await context.params;

    const id = params.id;

    await prisma.bankAccount.delete(
      {
        where: { id },
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error(
      'DELETE_ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          error.message,
      },
      { status: 500 }
    );
  }
}