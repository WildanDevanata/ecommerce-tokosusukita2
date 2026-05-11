import { prisma } from '@/lib/prisma';
import {
  NextResponse,
} from 'next/server';

type Params = {
  params: {
    addressId: string;
  };
};

export async function DELETE(
  req: Request,
  { params }: Params
) {
  try {
    await prisma.address.delete({
      where: {
        id: params.addressId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          'Gagal hapus alamat',
      },
      { status: 500 }
    );
  }
}