import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

const user = await prisma.user.findUnique({
  where: {
    email,
  },

  include: {
    addresses: true,
  },
});

    // cek user
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email tidak ditemukan',
        },
        { status: 401 }
      );
    }

    // cek password
    // sementara plain text dulu
    // nanti bisa pakai bcrypt
    if (user.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password salah',
        },
        { status: 401 }
      );
    }

    // jangan kirim password ke frontend
    const safeUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,

  addresses: user.addresses,

  createdAt:
    user.createdAt.toISOString(),
};

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      { status: 500 }
    );
  }
}