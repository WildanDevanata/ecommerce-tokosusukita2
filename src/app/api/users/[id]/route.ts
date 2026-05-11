import { prisma } from '@/lib/prisma';
import {
  NextRequest,
  NextResponse,
} from 'next/server';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  req: NextRequest,
  { params }: Params
) {
  try {
    const body = await req.json();

    // ✅ wajib await params
    const { id } = await params;

    const updatedUser =
      await prisma.user.update({
        where: {
          id,
        },

        data: {
          name: body.name,
          phone: body.phone,
        },

        include: {
          addresses: true,
        },
      });

    return NextResponse.json(
      updatedUser
    );
  } catch (error) {
    console.log(
      'UPDATE USER ERROR:',
      error
    );

    return NextResponse.json(
      {
        message:
          'Gagal update user',
      },
      {
        status: 500,
      }
    );
  }
}