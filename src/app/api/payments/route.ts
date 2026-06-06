import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Handler untuk UPDATE bukti pembayaran
// Di dalam file API PATCH pembayaran Anda
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { paymentProofUrl, paymentMethod } = body;

    // Menggunakan transaksi untuk update dua tabel sekaligus
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
          paymentProof: paymentProofUrl, // Mengisi kolom yang tadinya null di image_d4c924.png
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