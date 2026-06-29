import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// ================= HELPERS =================
const formatOrderResponse = (order: any) => ({
  id: order.id,
  userId: order.userId,
  orderNumber: order.orderNumber,

  totalAmount: order.totalAmount,
  shippingCost: order.shippingCost,
  payments: order.payments || [],
  status: order.status,
  paymentStatus: order.paymentStatus,

  paymentMethod: order.paymentMethod,

  trackingNumber: order.trackingNumber,
  courier: order.courier,

  shippingService: order.shippingService || null,
  shippingEtd: order.shippingEtd || null,

  notes: order.notes,

  paymentProofUrl: order.paymentProofUrl,
  snapToken: order.snapToken || null,

  createdAt: order.createdAt,
  updatedAt: order.updatedAt,

  userName:
    order.user?.name ||
    order.shippingRecipient ||
    "Guest",

  userEmail:
    order.user?.email || "-",

  items:
    order.items?.map((item: any) => ({
      id: item.id,
      productId: item.productId,

      productName:
        item.product?.name || "Produk",

      quantity: item.quantity,
      price: item.price,

      isReviewed: !!item.review,

      image:
        item.product?.image || null,

      productBgColor:
        (item.product as any)?.bgColor ||
        "bg-gray-100",

      review: item.review || null,
    })) || [],

  shippingAddress: {
    recipientName:
      order.shippingRecipient,

    phone: order.shippingPhone,

    address:
      order.shippingAddress,

    city: order.shippingCity,

    province:
      order.shippingProvince,

    postalCode:
      order.shippingPostalCode,
  },
});

// ================= GET (VERSI YANG SUDAH DIPERBAIKI) =================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Menghapus proteksi pemblokiran 'ORD-' dan menggantinya dengan pencarian fleksibel
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderNumber: id } // Jika yang masuk adalah 'ORD-xxx', dia akan dicocokkan di sini
        ]
      },
      include: {
        user: true,
        items: { include: { product: true, review: true } },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(formatOrderResponse(order));
  } catch (error) {
    console.error("Error pada GET Order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ================= PATCH =================
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 🛡️ PROTEKSI API: Tolak modifikasi via rute jika parameter menggunakan orderNumber
    if (id.startsWith('ORD-')) {
      return NextResponse.json(
        { error: "Akses Ditolak: Modifikasi data wajib menggunakan ID unik pesanan." },
        { status: 400 }
      );
    }

    // Ambil data pesanan lama berdasarkan ID tunggal
    const existingOrder = await prisma.order.findUnique({
      where: { id: id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🛡️ SECURITY CHECK: Jika order sudah diulas (REVIEWED), status alur logistik tidak boleh diturunkan kembali
    if (existingOrder.status === "REVIEWED" && body.status && body.status !== "REVIEWED") {
      return NextResponse.json(
        { error: "Pesanan telah selesai diulas oleh pembeli dan tidak dapat diubah status logistiknya kembali." },
        { status: 400 }
      );
    }

    // VALIDASI CANCEL
    if (body.status === "CANCELLED" && existingOrder.status !== "PENDING") {
      return NextResponse.json(
        { error: "Pesanan yang sudah diproses tidak dapat dibatalkan" },
        { status: 400 }
      );
    }

    // DYNAMIC UPDATE MAP
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.courier !== undefined) updateData.courier = body.courier;
    if (body.shippingService !== undefined) updateData.shippingService = body.shippingService;
    if (body.shippingEtd !== undefined) updateData.shippingEtd = body.shippingEtd;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentProofUrl !== undefined) updateData.paymentProofUrl = body.paymentProofUrl;
    if (body.snapToken !== undefined) updateData.snapToken = body.snapToken;

    // JIKA USER UPLOAD BUKTI TRANSFER, OTOMATIS UBAH STATUS KE WAITING_VERIFICATION
    if (body.paymentProofUrl && existingOrder.paymentStatus === 'PENDING') {
      updateData.paymentStatus = 'WAITING_VERIFICATION';
    }

    // EKSEKUSI UPDATE DATA MENGGUNAKAN ID ASLI DATABASE
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: {
          user: true,
          items: { include: { product: true, review: true } },
        },
      }),
      prisma.payment.updateMany({
        where: { orderId: existingOrder.id },
        data: {
          paymentProof: body.paymentProofUrl || existingOrder.paymentProofUrl,
          status: updateData.paymentStatus || 'WAITING_VERIFICATION',
        },
      }),
    ]);

    // ================= LOGIKA TRIGGER NOTIFIKASI ADMIN =================
    const customerName = updatedOrder.user?.name || updatedOrder.shippingRecipient || "Pelanggan";

    // KONDISI A: Admin Memverifikasi Pembayaran (Menjadi Lunas)
    if (body.paymentStatus === "PAID" && existingOrder.paymentStatus !== "PAID") {
      console.log(`🚀 Trigger Notifikasi Pembayaran Lunas untuk Order #${updatedOrder.orderNumber}`);
      await prisma.notification.create({
        data: {
          userId: null, 
          title: "Pembayaran Diterima! 💳",
          message: `Pesanan #${updatedOrder.orderNumber} milik ${customerName} telah lunas sebesar Rp ${Number(updatedOrder.totalAmount).toLocaleString('id-ID')} dan siap diproses.`,
          type: "PAYMENT", 
          link: `/admin/orders/${updatedOrder.orderNumber}`, 
        },
      });
    }

    // KONDISI C: User Unggah Bukti Transfer Baru (Atau mengganti bukti lama)
    if (body.paymentProofUrl && (body.paymentProofUrl !== existingOrder.paymentProofUrl)) {
      console.log(`📩 Trigger Notifikasi Bukti Pembayaran Masuk untuk Order #${updatedOrder.orderNumber}`);
      await prisma.notification.create({
        data: {
          userId: null,
          title: "Bukti Transfer Baru! 📥",
          message: `${customerName} telah mengunggah bukti pembayaran untuk pesanan #${updatedOrder.orderNumber}. Mohon segera verifikasi.`,
          type: "PAYMENT",
          link: `/admin/payments`, 
        },
      });
    }

    // KONDISI B: Menyelesaikan Pesanan
    if (body.status === "DELIVERED" && existingOrder.status !== "DELIVERED" && existingOrder.status !== "REVIEWED") {
      await prisma.notification.create({
        data: {
          userId: null,
          title: "Pesanan Telah Selesai! ✅",
          message: `Pesanan #${updatedOrder.orderNumber} telah diterima dan diselesaikan oleh ${customerName}.`,
          type: "ORDER",
          link: `/admin/orders/${updatedOrder.orderNumber}`,
        },
      });
    }
    // ===================================================================

    // REVALIDATE CACHE NEXT.JS
    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/payments"); 

    return NextResponse.json(formatOrderResponse(updatedOrder));
  } catch (error) {
    console.error("Error pada PATCH Order:", error);
    return NextResponse.json(
      { error: "Gagal update order" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Perbaikan query pencarian fleksibel agar method DELETE tidak mengalami crash saat menerima ID sistem database
    const orderToDelete = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderNumber: id }
        ]
      }
    });

    if (!orderToDelete) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id: orderToDelete.id },
    });

    revalidatePath("/customer/orders");
    revalidatePath("/admin/orders");

    return NextResponse.json({
      message: "Order berhasil dihapus",
    });
  } catch (error) {
    console.error("Error pada DELETE Order:", error);
    return NextResponse.json(
      { error: "Gagal menghapus order" },
      { status: 500 }
    );
  }
}