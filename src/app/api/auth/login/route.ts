import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validasi input kosong
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email dan password wajib diisi',
        },
        { status: 400 }
      );
    }

    // Gunakan .trim() untuk menghapus spasi tidak sengaja di ujung email
    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
      include: {
        addresses: true,
      },
    });

    // 1. Cek apakah user ada
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email tidak ditemukan',
        },
        { status: 401 }
      );
    }

    // 2. Cek jika user mendaftar lewat Google (password kosong di DB)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun ini terdaftar menggunakan Google. Silakan login via Google.',
        },
        { status: 401 }
      );
    }

    // 3. Bandingkan password text biasa dengan hash di DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password salah',
        },
        { status: 401 }
      );
    }

    // 4. Pisahkan password sebelum dikirim ke frontend
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      createdAt: user.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: safeUser,
    });

  } catch (error: any) {
    console.error('❌ Error API Login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server',
        details: error.message,
      },
      { status: 500 }
    );
  }
}