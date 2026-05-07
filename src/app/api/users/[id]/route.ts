import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();

    const updated = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: 'Gagal update user' },
      { status: 500 }
    );
  }
}