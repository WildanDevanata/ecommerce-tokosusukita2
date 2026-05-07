import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,

        items: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    const enrichedOrders = orders.map(
      (order) => ({
        id: order.id,

        orderNumber: order.orderNumber,

        userName:
          order.user?.name ||
          order.shippingRecipient ||
          "Guest",

        userEmail:
          order.user?.email || "-",

        totalAmount:
          order.totalAmount,

        paymentStatus:
          order.paymentStatus,

        paymentMethod:
          order.paymentMethod,
        paymentProofUrl: order.paymentProofUrl || (order as any).payment?.paymentProof || null,

        status: order.status,

        createdAt:
          order.createdAt,

        updatedAt:
          order.updatedAt,

        trackingNumber:
          order.trackingNumber,

        courier: order.courier,

        items: order.items.map(
          (item) => ({
            id: item.id,

            productName:
              item.product?.name ||
              "Produk",

            quantity:
              item.quantity,

            price: item.price,

            productEmoji: "📦",

            productBgColor:
              "bg-gray-100",
          })
        ),

        shippingAddress: {
          recipientName:
            order.shippingRecipient ||
            order.user?.name ||
            "-",

          phone:
            order.user?.phone ||
            "-",

          address:
            order.shippingAddress ||
            "-",

          city:
            order.shippingCity || "-",
        },
      })
    );

    return NextResponse.json(
      enrichedOrders
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal mengambil data orders",
      },
      {
        status: 500,
      }
    );
  }
}