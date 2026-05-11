import { prisma } from '@/lib/prisma';
import {
  NextRequest,
  NextResponse,
} from 'next/server';

type Params = {
  params: {
    id: string;
  };
};

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  try {
    const body = await req.json();

    const address =
      await prisma.address.create({
        data: {
          userId: params.id,

          label: body.label,

          recipientName:
            body.recipientName,

          phone: body.phone,

          address: body.address,

          city: body.city,

          province:
            body.province,

          postalCode:
            body.postalCode,

          isDefault:
            body.isDefault,
        },
      });

    return NextResponse.json(
      address
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          'Gagal tambah alamat',
      },
      { status: 500 }
    );
  }
}