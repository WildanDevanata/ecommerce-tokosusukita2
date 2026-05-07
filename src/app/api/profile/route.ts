import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // sementara hardcode admin
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@tokosusukita.com',
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal mengambil profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const updated = await prisma.user.update({
      where: {
        email: 'admin@tokosusukita.com',
      },
      data: {
        name: body.name,
        phone: body.phone,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal update profile' },
      { status: 500 }
    );
  }
}