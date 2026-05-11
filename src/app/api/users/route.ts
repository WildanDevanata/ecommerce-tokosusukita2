import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users =
      await prisma.user.findMany({
        include: {
          orders: true,
          addresses: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    const formatted =
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,

        createdAt:
          user.createdAt.toISOString(),

        orderCount:
          user.orders.length,

        addresses:
          user.addresses,
      }));

    return NextResponse.json(
      formatted
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          'Gagal mengambil user',
      },
      { status: 500 }
    );
  }
}