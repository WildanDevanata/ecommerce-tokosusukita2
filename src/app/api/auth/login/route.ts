import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
// 1. IMPORT BCRYPTJS
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(), // Pastikan di-lowercase agar konsisten dengan register
      },
      include: {
        addresses: true,
      },
    });

    // Cek user
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email tidak ditemukan',
        },
        { status: 401 }
      );
    }

    // 2. PERBAIKAN DI SINI: Gunakan bcrypt.compare untuk mengecek password terenkripsi
    // Jika user login via Google (password null di DB), pastikan ditangani aman
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun ini terdaftar menggunakan Google. Silakan login via Google.',
        },
        { status: 401 }
      );
    }

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

    // Jangan kirim password ke frontend
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
      user: safeUser,
    });
  } catch (error: any) {
    console.error('❌ Error API Login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}