// app/api/orders/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true, // WAJIB ADA: untuk mengambil field 'email' dari tabel User
      },
      orderBy: { createdAt: 'desc' },
    });

    // Petakan data agar frontend menerima field userEmail secara eksplisit
    const enrichedOrders = orders.map((order) => ({
      ...order,
      userName: order.user?.name || order.shippingRecipient || "Guest",
      userEmail: order.user?.email || "-", // Ini yang akan muncul di kolom pelanggan
    }));

    return NextResponse.json(enrichedOrders);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}