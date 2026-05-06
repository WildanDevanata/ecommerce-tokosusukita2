// app/api/bank-accounts/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const bankAccounts = await prisma.bankAccount.findMany(); // Hapus orderBy
    return NextResponse.json(bankAccounts);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data dari database" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bankName, accountNumber, accountName, type, isActive, color } = body;

    const newAccount = await prisma.bankAccount.create({
      data: {
        bankName,
        accountNumber,
        accountName,
        type,
        isActive: isActive ?? true,
        // Jika color tidak dikirim dari form, baru pakai default logic
        color: color || (type === 'EWALLET' ? 'bg-green-500' : 'bg-blue-600'),
      },
    });
    return NextResponse.json(newAccount);
  } catch (error) {
    return NextResponse.json({ message: "Gagal" }, { status: 500 });
  }
}