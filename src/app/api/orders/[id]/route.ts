import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } =
      await context.params;

    const order =
      await prisma.order.findUnique({
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
        {
          error:
            "Order tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const formattedOrder = {
      id: order.id,

      userId: order.userId,

      orderNumber:
        order.orderNumber,

      totalAmount:
        order.totalAmount,

      shippingCost:
        order.shippingCost,

      status: order.status,

      paymentStatus:
        order.paymentStatus,

      paymentMethod:
        order.paymentMethod,

      trackingNumber:
        order.trackingNumber,

      courier: order.courier,

      notes: order.notes,

      paymentProofUrl:
        order.paymentProofUrl,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,

      items: order.items.map(
        (item) => ({
          id: item.id,

          productId:
            item.productId,

          productName:
            item.product?.name ||
            "Produk",

          quantity:
            item.quantity,

          price: item.price,
        })
      ),

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
    };

    return NextResponse.json(
      formattedOrder
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal mengambil detail order",
      },
      {
        status: 500,
      }
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
    const { id } =
      await context.params;

    const body = await req.json();

    const order =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          status: body.status,

          paymentStatus:
            body.paymentStatus,

          trackingNumber:
            body.trackingNumber,

          courier: body.courier,

          notes: body.notes,

          paymentProofUrl:
            body.paymentProofUrl,
        },
      });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal update order",
      },
      {
        status: 500,
      }
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
    const { id } =
      await context.params;

    await prisma.order.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Order berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Gagal menghapus order",
      },
      {
        status: 500,
      }
    );
  }
}