import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import midtransClient from 'midtrans-client';

// ================= HELPERS =================

const enrichOrderData = (order: any) => ({
  id: order.id,
  userId: order.userId,
  orderNumber: order.orderNumber,

  userName:
    order.user?.name ||
    order.shippingRecipient ||
    'Guest',

  userEmail:
    order.user?.email || '-',

  totalAmount: order.totalAmount,
  shippingCost: order.shippingCost || 0,
  paymentStatus: order.paymentStatus,

  // Mengambil paymentMethod dari relasi tabel Payment jika ada
  paymentMethod:
    order.paymentMethod || 
    order.payments?.[0]?.method || 
    'MIDTRANS',

  // Mengambil bukti pembayaran dari relasi tabel Payment
  paymentProofUrl:
    order.payments?.[0]?.paymentProof ||
    null,

  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  trackingNumber: order.trackingNumber || null,
  courier: order.courier || null,
  shippingService: order.shippingService || null,
  shippingEtd: order.shippingEtd || null,
  notes: order.notes,
  snapToken: order.snapToken || null,

  items: order.items.map((item: any) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || 'Produk',
    quantity: item.quantity,
    price: item.price,
    isReviewed: !!item.review,
    productBgColor: 'bg-gray-100',
    image: item.product?.image || null,
    review: item.review || null,
  })),

  // ================= SHIPPING ADDRESS =================
  shippingAddress: {
    recipientName: order.shippingRecipient,
    phone: order.shippingPhone,
    address: order.shippingAddress,
    city: order.shippingCity,
    province: order.shippingProvince,
    postalCode: order.shippingPostalCode,
  },

  // ================= SHIPPING INFO =================
  shippingInfo: {
    courier: order.courier || '-',
    service: order.shippingService || '-',
    etd: order.shippingEtd || '-',
    cost: order.shippingCost || 0,
    trackingNumber: order.trackingNumber || '-',
  },
});

// ================= GET =================

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        payments: true,
        items: {
          include: {
            product: true,
            review: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const enrichedOrders = orders.map((order) => {
      const allReviewed =
        order.items.length > 0 &&
        order.items.every((item: any) => item.review);

      return enrichOrderData({
        ...order,
        status: allReviewed ? 'REVIEWED' : order.status,
      });
    });

    return NextResponse.json(enrichedOrders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal mengambil data orders' },
      { status: 500 }
    );
  }
}

// ================= POST =================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNumber = `ORD-${Date.now()}`;

    // ================= CREATE ORDER =================
    let order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: body.totalAmount,
        shippingCost: body.shippingCost || 0,
        paymentStatus: body.paymentStatus || 'PENDING',
        status: body.status || 'PENDING',
        trackingNumber: body.trackingNumber || null,
        courier: body.courier || null,
        shippingService: body.shippingService || null,
        shippingEtd: body.shippingEtd || null,
        notes: body.notes || null,
        // ❌paymentProofUrl TELAH DIHAPUS DARI SINI KARENA TIDAK ADA DI MODEL ORDER DB Anda
        
        user: {
          connect: {
            id: body.userId,
          },
        },

        // ================= SHIPPING ADDRESS =================
        shippingRecipient: body.shippingRecipient,
        shippingPhone: body.shippingPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingProvince: body.shippingProvince,
        shippingPostalCode: body.shippingPostalCode,

        // ================= ITEMS =================
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },

        // ================= PAYMENTS RELATION =================
        payments: {
          create: [
            {
              userId: body.userId,
              method: body.paymentMethod || 'MIDTRANS',
              status: body.paymentStatus || 'PENDING',
              amount: body.totalAmount,
              // Jika dari frontend mengirimkan bukti transfer manual, masukkan ke sini:
              paymentProof: body.paymentProofUrl || null 
            }
          ]
        }
      },
      include: {
        user: true,
        payments: true, 
        items: {
          include: {
            product: true,
            review: true,
          },
        },
      },
    });

    let snapToken = null;

    // ================= MIDTRANS INTEGRATION =================
    if (body.paymentMethod === 'MIDTRANS') {
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY || '',
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '',
      });

      const parameter = {
        transaction_details: {
          order_id: `${order.id}-${Date.now()}`,
          gross_amount: body.totalAmount,
        },
        customer_details: {
          first_name: order.user?.name || body.shippingRecipient,
          email: order.user?.email || undefined,
          phone: body.shippingPhone,
        },
        credit_card: {
          secure: true,
        },
      };

      const transaction = await snap.createTransaction(parameter);
      snapToken = transaction.token;

      // ================= SAVE SNAP TOKEN =================
      try {
        order = await prisma.order.update({
          where: { id: order.id },
          data: {
            snapToken: snapToken,
          } as any,
          include: {
            user: true,
            payments: true,
            items: {
              include: {
                product: true,
                review: true,
              },
            },
          },
        });
      } catch (e) {
        console.log('Kolom snapToken tidak dapat diperbarui atau belum tersedia di DB');
      }
    }

    // ================= REVALIDATE PATHS =================
    revalidatePath('/customer/orders');
    revalidatePath(`/customer/orders/${order.id}`);
    revalidatePath('/admin/orders');

    // ================= FINAL RESPONSE =================
    const finalResponse = {
      ...enrichOrderData(order),
      snapToken,
    };

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error POST Order:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    );
  }
}