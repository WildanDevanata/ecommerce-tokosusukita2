import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Destruktur data dari body request
    const { paymentProofUrl, paymentMethod, paymentStatus } = body;

    // 1. Validasi keberadaan Order
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Update data order di database
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentProofUrl: paymentProofUrl,
        paymentMethod: paymentMethod, // e.g., 'TRANSFER'
        paymentStatus: paymentStatus || 'WAITING_VERIFICATION',
        // Jika status pesanan masih PENDING, bisa dipertimbangkan tetap PENDING 
        // sampai admin menekan tombol "Konfirmasi" di dashboard admin.
      },
    });

    return NextResponse.json(
      { 
        message: 'Bukti pembayaran berhasil diperbarui', 
        order: updatedOrder 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: error.message },
      { status: 500 }
    );
  }
}