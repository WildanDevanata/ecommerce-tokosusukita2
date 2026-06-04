import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// 1. ENDPOINT PATCH (UPDATE DATA USER LENGKAP)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const { id } = await params;

    // Siapkan object penampung data update bawaan database
    const updateData: any = {
      name: body.name,
      email: body.email?.toLowerCase().trim(),
      phone: body.phone,
      isActive: body.isActive,
    };

    // JIKA PASSWORD DIISI: Enkripsi dengan bcryptjs sebelum masuk ke DB
    if (body.password && body.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        addresses: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('❌ UPDATE USER ERROR:', error);
    
    // Cegah error jika admin memasukkan email yang sudah dipakai user lain
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Email tersebut sudah digunakan oleh pengguna lain.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Gagal update user', details: error.message },
      { status: 500 }
    );
  }
}

// 2. ENDPOINT DELETE (HAPUS USER PERMANEN)
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Opsional: Cek pencegahan agar admin tidak menghapus dirinya sendiri secara tidak sengaja
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pengguna berhasil dihapus secara permanen',
    });
  } catch (error: any) {
    console.error('❌ DELETE USER ERROR:', error);
    return NextResponse.json(
      { message: 'Gagal menghapus user, pastikan user tidak terikat data transaksi penting.', details: error.message },
      { status: 500 }
    );
  }
}