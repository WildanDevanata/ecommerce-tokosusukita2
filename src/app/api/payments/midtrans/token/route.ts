import { NextResponse } from 'next/server';
// @ts-ignore
import midtransClient from 'midtrans-client';
// Import prisma client sesuai dengan lokasi di proyek Anda (biasanya di @/lib/prisma atau @/prisma/db)
import { prisma } from '@/lib/prisma'; 

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Ambil data pesanan dari database berdasarkan orderId
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true, // Menyertakan data item produk yang dibeli
        // user: true, // Jika skema Anda memiliki relasi user untuk mengambil email pembeli asli
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Siapkan item_details untuk Midtrans berdasarkan array items Anda
    const itemDetails = order.items.map((item: any) => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      name: `Produk ID ${item.productId}`, // Jika di model items ada nama produk, silakan ganti ke item.productName
    }));

    // Tambahkan ongkir sebagai item tersendiri di Midtrans jika ada nilainya
    if (order.shippingCost && order.shippingCost > 0) {
      itemDetails.push({
        id: 'SHIPPING-COST',
        price: order.shippingCost,
        quantity: 1,
        name: `Ongkos Kirim (${order.courier || 'Ekspedisi'})`,
      });
    }

    // 3. Konfigurasi parameter transaksi Midtrans Snap
    const parameter = {
      transaction_details: {
        // Gabungkan orderNumber dengan timestamp agar terhindar dari error 407 (Duplicate Order ID) di Midtrans jika user klik ulang
        order_id: `${order.orderNumber}-${Date.now()}`, 
        gross_amount: order.totalAmount, // Nilainya 695000 sesuai data Anda
      },
      item_details: itemDetails,
      customer_details: {
        first_name: order.shippingRecipient, // 'Budi Santoso'
        phone: order.shippingPhone,          // '082345678901'
        // Jika tidak berelasi ke tabel user untuk email, kita bisa fallback atau sediakan default string
        email: 'customer@tokosusukita.com', 
        shipping_address: {
          first_name: order.shippingRecipient,
          phone: order.shippingPhone,
          address: order.shippingAddress,    // 'Jl. Melati No. 25'
          city: order.shippingCity,          // 'Jakarta Timur'
          postal_code: order.shippingPostalCode, // '13210'
          country_code: 'IDN'
        }
      }
    };

    // 4. Buat transaksi ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });

  } catch (error: any) {
    console.error('Midtrans Token Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat token pembayaran' },
      { status: 500 }
    );
  }
}