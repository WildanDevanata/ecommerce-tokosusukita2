import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

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
      where: {
        id,
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const formattedOrder = {
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
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // --- PERBAIKAN: Sertakan image dan bgColor dari tabel product ---
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || "Produk",
        quantity: item.quantity,
        price: item.price,
        image: item.product?.image || null, // URL Cloudinary agar muncul di detail
        productBgColor: (item.product as any)?.bgColor || "bg-gray-100",
        productEmoji: "🥛",
      })),
      
      shippingAddress: {
        recipientName: order.shippingRecipient,
        phone: order.shippingPhone,
        address: order.shippingAddress,
        city: order.shippingCity,
        province: order.shippingProvince,
        postalCode: order.shippingPostalCode,
      },
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil detail order" },
      { status: 500 }
    );
  }
}

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

    // 1. Validasi khusus jika ini adalah aksi pembatalan (CANCELLED)
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

    // 2. Buat objek update secara dinamis untuk menghindari nilai 'undefined' masuk ke Prisma
    const updateData: any = {};
    
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
    if (body.courier !== undefined) updateData.courier = body.courier;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.paymentProofUrl !== undefined) updateData.paymentProofUrl = body.paymentProofUrl;

    // 3. Eksekusi update ke database
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // On-demand Revalidation agar cache langsung segar
    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${id}`);

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal update order" },
      { status: 500 }
    );
  }
}

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
      where: {
        id,
      },
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