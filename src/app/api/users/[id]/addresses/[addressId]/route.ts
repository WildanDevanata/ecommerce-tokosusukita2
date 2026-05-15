import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Tipe Props untuk Next.js 15
 * Params harus dibungkus dalam Promise
 */
type Props = {
  params: Promise<{
    id: string;
    addressId: string;
  }>;
};

// ==========================================
// [PATCH] - EDIT ALAMAT
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: Props
) {
  try {
    // 1. Ambil data baru dari body
    const body = await req.json();

    // 2. Unwrapping params (Wajib di Next.js 15)
    const { addressId } = await params;

    // 3. Update data di database
    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        label: body.label,
        recipientName: body.recipientName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        isDefault: body.isDefault,
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Update Address Error:", error);
    return NextResponse.json(
      { message: 'Gagal memperbarui alamat', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ==========================================
// [DELETE] - HAPUS ALAMAT
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  try {
    // 1. Unwrapping params
    const { addressId } = await params;

    // 2. Eksekusi hapus di Prisma
    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alamat berhasil dihapus',
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return NextResponse.json(
      { message: 'Gagal hapus alamat', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}