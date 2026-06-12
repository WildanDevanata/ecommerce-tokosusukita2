import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Gunakan port 465 untuk SSL
      auth: {
        user: 'wildanryzki55@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Kode 16 karakter tanpa spasi
      },
    });

    await transporter.sendMail({
      from: `"Kontak Website" <wildanryzki55@gmail.com>`,
      to: 'wildanryzki55@gmail.com',
      replyTo: email,
      subject: `[Pesan Baru] ${subject}`,
      text: `Nama: ${name}\nEmail: ${email}\n\nPesan: ${message}`,
      html: `<div><p><strong>Nama:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p></div>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}