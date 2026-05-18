import { prisma } from '@/lib/prisma';
import OrdersClient from '@/components/admin/OrdersClient';

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
    paymentMethod: o.paymentMethod,
    trackingNumber: o.trackingNumber,
    courier: o.courier,
    
    // Perbaikan: Ubah objek Date menjadi string ISO agar aman dilempar ke 'use client'
    createdAt: o.createdAt.toISOString(),

    items: o.items.map((i) => ({
      id: i.id,
      productName: i.product?.name || 'Produk Tidak Diketahui', // Pencegahan jika produk null
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