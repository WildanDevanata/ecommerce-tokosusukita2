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

// ================= GET =================
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log("=== API ORDERS DEBUG ===");
    console.log("Mencari Order dengan ID/OrderNumber:", id);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderNumber: id }
        ]
      },
      include: {
        user: true,
        items: { include: { product: true, review: true } },
      },
    });

    if (!order) {
      console.log(`❌ Order dengan ID ${id} TIDAK DITEMUKAN di database.`);
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    console.log(`✅ Order ditemukan! Nomor Order: ${order.orderNumber}`);
    return NextResponse.json(formatOrderResponse(order));
  } catch (error) {
    console.error("💥 CRASH PADA GET API ORDERS:", error);
    return NextResponse.json({ error: "Gagal mengambil detail order" }, { status: 500 });
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

    // 1. CARI ORDER BERDASARKAN ID ATAU ORDERNUMBER SECARA FLEKSIBEL
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderNumber: id }
        ]
      },
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

    // 2. EKSEKUSI UPDATE DATA MENGGUNAKAN ID ASLI DATABASE
    // 2. EKSEKUSI UPDATE DATA MENGGUNAKAN ID ASLI DATABASE
const [updatedOrder] = await prisma.$transaction([
  // Update tabel Order
  prisma.order.update({
    where: { id: existingOrder.id },
    data: updateData,
    include: {
      user: true,
      items: { include: { product: true, review: true } },
    },
  }),
  // Sinkronisasi ke tabel Payment
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

    // 🔥 KONDISI C (BARU): User Unggah Bukti Transfer Baru
    if (body.paymentProofUrl && !existingOrder.paymentProofUrl) {
      console.log(`📩 Trigger Notifikasi Bukti Pembayaran Masuk untuk Order #${updatedOrder.orderNumber}`);
      await prisma.notification.create({
        data: {
          userId: null,
          title: "Bukti Transfer Baru! 📥",
          message: `${customerName} telah mengunggah bukti pembayaran untuk pesanan #${updatedOrder.orderNumber}. Mohon segera verifikasi.`,
          type: "PAYMENT",
          link: `/admin/payments`, // Langsung diarahkan ke modul manajemen pembayaran admin yang baru saja Anda perbaiki
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
    revalidatePath("/admin/payments"); // Pastikan data pembayaran terbaru langsung bersih dari cache admin

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

    // DELETE BERDASARKAN orderNumber
    await prisma.order.delete({
      where: {
        orderNumber: id,
      },
    });

    revalidatePath("/customer/orders");
    revalidatePath("/admin/orders");

    return NextResponse.json({
      message: "Order berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus order" },
      { status: 500 }
    );
  }
}