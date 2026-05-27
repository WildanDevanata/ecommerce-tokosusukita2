import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    // 1. Validasi Input Sederhana
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Semua kolom data wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal harus 8 karakter' },
        { status: 400 }
      );
    }

    // 2. Cek Apakah Email Sudah Terdaftar di Database
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: 'Alamat email ini sudah terdaftar' },
        { status: 400 }
      );
    }

    // 3. Cek Apakah Nomor Handphone Sudah Terdaftar
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phone: phone },
    });

    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, message: 'Nomor handphone ini sudah terdaftar' },
        { status: 400 }
      );
    }

    // 4. Enkripsi Kata Sandi (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Simpan User Baru ke Database via Prisma
    // Secara default, role akan otomatis diset sebagai CUSTOMER/USER sesuai bawaan skema default Anda
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: 'CUSTOMER', // Menyesuaikan dengan enum Role di schema.prisma Anda
        isActive: true,
      },
    });

    // 6. Kembalikan Response Sukses (Tanpa menyertakan password demi keamanan)
    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Error pada API Register:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal server', details: error.message },
      { status: 500 }
    );
  }
}