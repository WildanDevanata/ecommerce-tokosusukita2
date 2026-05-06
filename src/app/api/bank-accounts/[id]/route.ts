import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    // Hapus id dari body agar tidak konflik dengan where: { id }
    const { id: _, ...updateData } = body;

    const updated = await prisma.bankAccount.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json({ message: "Gagal Update", error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.bankAccount.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ message: "Gagal Hapus", error: error.message }, { status: 500 });
  }
}