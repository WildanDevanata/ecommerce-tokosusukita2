import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate, getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "@/lib/helpers";
import OrdersClient from "@/components/admin/OrdersClient";

export default async function Page() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  });

  // Mapping biar sesuai UI figma kamu
  const mappedOrders = orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    userName: o.user?.name || "User",
    userEmail: o.user?.email || "-",
    totalAmount: o.totalAmount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
    trackingNumber: o.trackingNumber,
    courier: o.courier,

    items: o.items.map(i => ({
      id: i.id,
      productName: i.product.name,
      price: i.price,
      quantity: i.quantity,
      productEmoji: "📦",
      productBgColor: "bg-gray-100"
    })),

    shippingAddress: {
      recipientName: o.user?.name || "-",
      phone: o.user?.phone || "-",
      address: o.shippingAddress || "-",
      city: o.city || "-"
    }
  }));

  return <OrdersClient orders={mappedOrders} />;
}