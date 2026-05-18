// import { NextResponse } from 'next/server';
// // @ts-ignore
// import midtransClient from 'midtrans-client';

// const snap = new midtransClient.Snap({
//     isProduction: false, // Set ke true jika sudah siap live (production)
//     serverKey: process.env.MIDTRANS_SERVER_KEY,
//     clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
// });

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const { orderId, totalAmount, user, items } = body;

//         // Struktur parameter sesuai dokumentasi Midtrans
//         const parameter = {
//             transaction_details: {
//                 order_id: orderId,
//                 gross_amount: totalAmount,
//             },
//             customer_details: {
//                 first_name: user.name,
//                 email: user.email,
//                 phone: user.phone || '',
//             },
//             item_details: items.map((item: any) => ({
//                 id: item.id,
//                 price: item.price,
//                 quantity: item.quantity,
//                 name: item.name.substring(0, 50), // Batasi nama produk maks 50 karakter
//             })),
//             // Opsional: Batasi metode pembayaran jika mau
//             enabled_payments: ["credit_card", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "indomaret", "alfamart"],
//         };

//         // Minta token Snap ke Midtrans
//         const transaction = await snap.createTransaction(parameter);

//         return NextResponse.json({
//             token: transaction.token,
//             redirect_url: transaction.redirect_url
//         });
//     } catch (error: any) {
//         console.error("Midtrans Error:", error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }