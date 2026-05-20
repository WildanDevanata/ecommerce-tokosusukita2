import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Ubah tipe data menjadi Promise
) {
  try {
    const { id: orderId } = await params; // 2. Tambahkan await di sini

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID dibutuhkan' }, { status: 400 });
    }

    // Update status order di database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error confirming order payment:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui status pesanan' },
      { status: 500 }
    );
  }
}