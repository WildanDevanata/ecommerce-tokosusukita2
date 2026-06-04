import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =========================================================
// 🛒 1. GET: MEMBACA SEMUA ITEM KERANJANG BERDASARKAN USER ID
// =========================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Ambil semua data CartItem milik user, sertakan data relasi product-nya
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true, // Sertakan kategori jika ingin memunculkan nama kategori produk
          },
        },
      },
      orderBy: {
        id: "desc", // Urutkan dari yang terbaru dimasukkan
      },
    });

    return NextResponse.json({ success: true, data: cartItems });
  } catch (error: any) {
    console.error("GET_CART_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// =========================================================
// ➕ 2. POST: MENAMBAH PRODUK BARU / INCREMENT QUANTITY (+1)
// =========================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { message: "Missing userId or productId" },
        { status: 400 }
      );
    }

    // Cek apakah produk tersebut sudah ada di keranjang milik user ini
    const existingCartItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existingCartItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
      return NextResponse.json({ success: true, data: updatedItem });
    }

    // Jika belum ada, buat row baru
    const newCartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: 1,
      },
    });

    return NextResponse.json({ success: true, data: newCartItem }, { status: 201 });
  } catch (error: any) {
    console.error("POST_CART_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// =========================================================
// ✏️ 3. PATCH: MEMPERBARUI KUANTITAS SECARA SPESIFIK (Plus / Minus)
// =========================================================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { message: "Missing cartItemId or quantity" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { message: "Kuantitas minimal adalah 1" },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: Number(quantity) },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error("PATCH_CART_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

// =========================================================
// 🗑️ 4. DELETE: MENGHAPUS ITEM DARI KERANJANG
// =========================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // ID dari CartItem

    if (!id) {
      return NextResponse.json(
        { message: "Missing cart item ID" },
        { status: 400 }
      );
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Item berhasil dihapus dari keranjang" });
  } catch (error: any) {
    console.error("DELETE_CART_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}