import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Definisikan tipe params asinkronus untuk folder [id]
type RouteParams = {
  params: Promise<{ id: string }>;
};

// Handler untuk UPDATE bukti pembayaran berdasarkan ID
export async function PATCH(
  request: Request, 
  { params }: RouteParams
) {
  try {
    const { id } = await params; // Await params terlebih dahulu
    const body = await request.json();
    const { paymentProofUrl, paymentMethod } = body;

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          paymentProofUrl: paymentProofUrl,
          paymentMethod: paymentMethod,
          paymentStatus: 'WAITING_VERIFICATION',
        },
      }),
      prisma.payment.updateMany({
        where: { orderId: id },
        data: {
          paymentProof: paymentProofUrl,
          method: paymentMethod,
          status: 'WAITING_VERIFICATION',
        },
      }),
    ]);

    return NextResponse.json({ message: "Pembayaran berhasil diperbarui" });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate pembayaran" }, { status: 500 });
  }
}

// Handler untuk GET detail satu order berdasarkan ID
export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params; // Await params terlebih dahulu

    const order = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}