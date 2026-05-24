import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";


// ================= HELPERS: SAMAKAN FORMAT DENGAN FRONTEND =================
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
  notes: order.notes,
  paymentProofUrl: order.paymentProofUrl,
  snapToken: order.snapToken || null,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,

  items: order.items?.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || "Produk",
    quantity: item.quantity,
    price: item.price,
    isReviewed: !!item.review, 
    image: item.product?.image || null,
    productBgColor: (item.product as any)?.bgColor || "bg-gray-100",
    
    // 💡 TAMBAHKAN BARIS INI: Kirim objek review utuh ke frontend
    review: item.review || null, 
  })) || [],

  shippingAddress: {
    recipientName: order.shippingRecipient,
    phone: order.shippingPhone,
    address: order.shippingAddress,
    city: order.shippingCity,
    province: order.shippingProvince,
    postalCode: order.shippingPostalCode,
  },
});

// ================= GET HANDLER =================
export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      // 💡 UBAH DI SINI: Cari berdasarkan kolom orderNumber, bukan id
      where: { 
        orderNumber: id 
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            review: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(formatOrderResponse(order));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil detail order" },
      { status: 500 }
    );
  }
}

// ================= PATCH HANDLER =================
export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // 1. Validasi pembatalan (CANCELLED)
    if (body.status === "CANCELLED") {
      const existingOrder = await prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
      }

      if (existingOrder.status !== "PENDING") {
        return NextResponse.json(
          { error: "Pesanan yang sudah diproses tidak dapat dibatalkan" },
          { status: 400 }
        );
      }
    }

    // 2. Buat objek update secara dinamis
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.courier !== undefined) updateData.courier = body.courier;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentProofUrl !== undefined) updateData.paymentProofUrl = body.paymentProofUrl;
    if (body.snapToken !== undefined) updateData.snapToken = body.snapToken;

    // 3. 💡 PERBAIKAN SINTAKS: Struktur include yang benar & mendalam (Nested-include)
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        items: {
          include: {
            product: true,
            review: true,
          },
        },
      },
    });

    // On-demand Revalidation
    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${id}`);

    return NextResponse.json(formatOrderResponse(updatedOrder));
  } catch (error) {
    console.error("Error pada PATCH Order:", error);
    return NextResponse.json(
      { error: "Gagal update order" },
      { status: 500 }
    );
  }
}

// ================= DELETE HANDLER =================
export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    await prisma.order.delete({
      where: { id },
    });

    revalidatePath("/customer/orders");

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