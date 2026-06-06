import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/notifications
export async function GET() {
  try {
    // Ambil semua notifikasi untuk dashboard admin (userId = null)
    // Diurutkan dari yang paling baru masuk (createdAt desc)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Kembalikan response berformat objek dengan properti success agar dibaca oleh AppContext
    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("💥 Error fetching admin notifications:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data notifikasi" },
      { status: 500 }
    );
  }
}