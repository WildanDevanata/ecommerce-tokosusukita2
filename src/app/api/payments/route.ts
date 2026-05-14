import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Handler untuk UPDATE bukti pembayaran
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paymentProofUrl, paymentMethod } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentProofUrl: paymentProofUrl,
        paymentMethod: paymentMethod,
        paymentStatus: 'WAITING_VERIFICATION', // Status otomatis berubah
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate pembayaran" }, { status: 500 });
  }
}

// Handler untuk GET detail satu order (Jika dibutuhkan di halaman detail)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}