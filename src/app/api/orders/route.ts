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

    const enrichedOrders = orders.map((order) => ({
      id: order.id,

      userId: order.userId,

      orderNumber: order.orderNumber,

      userName:
        order.user?.name ||
        order.shippingRecipient ||
        "Guest",

      userEmail:
        order.user?.email || "-",

      totalAmount:
        order.totalAmount,

      shippingCost:
        order.shippingCost,

      paymentStatus:
        order.paymentStatus,

      paymentMethod:
        order.paymentMethod,

      paymentProofUrl:
        order.paymentProofUrl ||
        (order as any).payment?.paymentProof ||
        null,

      status:
        order.status,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,

      trackingNumber:
        order.trackingNumber,

      courier:
        order.courier,

      notes:
        order.notes,

      items: order.items.map((item) => ({
        id: item.id,

        productId:
          item.productId,

        productName:
          item.product?.name ||
          "Produk",

        quantity:
          item.quantity,

        price:
          item.price,

        productEmoji: "📦",

        productBgColor:
          "bg-gray-100",
      })),

      shippingAddress: {
        recipientName:
          order.shippingRecipient,

        phone:
          order.shippingPhone,

        address:
          order.shippingAddress,

        city:
          order.shippingCity,

        province:
          order.shippingProvince,

        postalCode:
          order.shippingPostalCode,
      },
    }));

    return NextResponse.json(enrichedOrders);
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,

        totalAmount:
          body.totalAmount,

        shippingCost:
          body.shippingCost || 0,

        paymentMethod:
          body.paymentMethod,

        paymentStatus:
          body.paymentStatus || "PENDING",

        status:
          body.status || "PENDING",

        trackingNumber:
          body.trackingNumber,

        courier:
          body.courier,

        notes:
          body.notes,

        paymentProofUrl:
          body.paymentProofUrl,

        user: {
          connect: {
            id: body.userId,
          },
        },

        shippingRecipient:
          body.shippingRecipient,

        shippingPhone:
          body.shippingPhone,

        shippingAddress:
          body.shippingAddress,

        shippingCity:
          body.shippingCity,

        shippingProvince:
          body.shippingProvince,

        shippingPostalCode:
          body.shippingPostalCode,

        items: {
          create: body.items.map(
            (item: any) => ({
              productId:
                item.productId,

              quantity:
                item.quantity,

              price:
                item.price,
            })
          ),
        },
      },

      include: {
        user: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal membuat pesanan",
      },
      {
        status: 500,
      }
    );
  }
}