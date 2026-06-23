import { prisma } from '@/lib/prisma';
import OrdersClient from '@/components/admin/OrdersClient';
export const dynamic = 'force-dynamic';

export default async function Page() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      // 🔥 WAJIB TAMBAHKAN INI agar data payment bisa diakses
      payments: true, 
    },
  });

  const mappedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    userName: o.user?.name || 'User',
    userEmail: o.user?.email || '-',
    totalAmount: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    
    // 🔥 PERBAIKAN: Ambil dari relasi payments, fallback ke manual jika perlu
    paymentMethod: o.payments?.[0]?.method || 'TRANSFER',
    paymentProof: o.payments?.[0]?.paymentProof || o.paymentProofUrl || null,
    
    trackingNumber: o.trackingNumber,
    courier: o.courier,
    
    createdAt: o.createdAt.toISOString(),

    items: o.items.map((i) => ({
      id: i.id,
      productName: i.product?.name || 'Produk Tidak Diketahui',
      quantity: i.quantity,
      price: i.price,
      productEmoji: '📦',
      productBgColor: 'bg-gray-100',
    })),

    shippingAddress: {
      recipientName: o.shippingRecipient,
      phone: o.shippingPhone,
      address: o.shippingAddress,
      city: o.shippingCity,
      province: o.shippingProvince,
      postalCode: o.shippingPostalCode,
    },
  }));

  return <OrdersClient orders={mappedOrders} />;
}