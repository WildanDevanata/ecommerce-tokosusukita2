import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import midtransClient from "midtrans-client"; // 1. IMPORT MIDTRANS SDK

// ================= HELPERS: ENRICH ORDER DATA =================
// Kita buat fungsi pembantu agar format response GET dan POST selalu sama persis
const enrichOrderData = (order: any) => ({
  id: order.id,
  userId: order.userId,
  orderNumber: order.orderNumber,
  userName: order.user?.name || order.shippingRecipient || "Guest",
  userEmail: order.user?.email || "-",
  totalAmount: order.totalAmount,
  shippingCost: order.shippingCost,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  paymentProofUrl: order.paymentProofUrl || (order as any).payment?.paymentProof || null,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  trackingNumber: order.trackingNumber,
  courier: order.courier,
  notes: order.notes,
  snapToken: order.snapToken || null, // Tambahkan properti snapToken ke format frontend
  items: order.items.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || "Produk",
    quantity: item.quantity,
    price: item.price,
    productEmoji: "📦",
    productBgColor: "bg-gray-100",
  })),
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

    const enrichedOrders = orders.map((order) => enrichOrderData(order));
    return NextResponse.json(enrichedOrders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil data orders" },
      { status: 500 }
    );
  }
}

// ================= POST HANDLER =================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNumber = `ORD-${Date.now()}`;

    // 1. Simpan pesanan ke database terlebih dahulu
    let order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: body.totalAmount,
        shippingCost: body.shippingCost || 0,
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentStatus || "PENDING",
        status: body.status || "PENDING",
        trackingNumber: body.trackingNumber,
        courier: body.courier,
        notes: body.notes,
        paymentProofUrl: body.paymentProofUrl,
        user: {
          connect: { id: body.userId },
        },
        shippingRecipient: body.shippingRecipient,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingProvince: body.shippingProvince,
        shippingPostalCode: body.shippingPostalCode,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
    });

    let snapToken = null;

    // 2. JIKA METODE PEMBAYARAN ADALAH MIDTRANS, MINTA TOKEN KE SERVER MIDTRANS
    if (body.paymentMethod === 'MIDTRANS') {
      const snap = new midtransClient.Snap({
        isProduction: false, // Gunakan false untuk lingkungan Sandbox (Testing)
        serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
      });

      const parameter = {
        transaction_details: {
          order_id: `${order.id}-${Date.now()}`, // Gabungkan dengan timestamp agar ID selalu unik di sandbox
          gross_amount: body.totalAmount,
        },
        customer_details: {
          first_name: order.user?.name || body.shippingRecipient,
          email: order.user?.email || undefined,
          phone: body.shippingPhone,
        },
        credit_card: {
          secure: true
        }
      };

      // Minta token transaksi ke Midtrans
      const transaction = await snap.createTransaction(parameter);
      snapToken = transaction.token;

      // (Opsional) Update snapToken ke database jika field tersebut ada di skema database Anda
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { snapToken: snapToken } as any // Typecast as any jika field belum migrasi di Prisma schema
        });
      } catch (e) {
        // Abaikan jika kolom snapToken memang belum dibuat di schema database
      }
    }

    // Pemicu pembersihan cache Next.js
    revalidatePath("/customer/orders");
    revalidatePath(`/customer/orders/${order.id}`);

    // 3. KEMBALIKAN DATA DENGAN FORMAT YANG SAMA SEPERTI FUNGSI GET
    // Pasang snapToken yang didapat ke dalam hasil return object
    const finalResponse = {
      ...enrichOrderData(order),
      snapToken: snapToken
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error("Error pada POST Order:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}