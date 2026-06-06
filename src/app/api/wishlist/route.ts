import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ── 1. GET: MENGAMBIL DAFTAR WISHLIST USER ──────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    // 🚀 SINKRONISASI: Ambil userId dari URL Query string sesuai fetch di AppContext
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. User ID tidak ditemukan.' },
        { status: 401 }
      );
    }

    // Ambil data wishlist beserta detail produk dan kategorinya
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // 🚀 SINKRONISASI: Kirim data berupa wishlistItems asli (yang punya properti productId)
    // agar pembacaan `.map((item: any) => item.productId)` di AppContext tidak menghasilkan undefined
    return NextResponse.json({
      success: true,
      data: wishlistItems, 
    }, { status: 200 });

  } catch (error) {
    console.error('Error GET Wishlist:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}

// ── 2. POST: TOGGLE WISHLIST (TAMBAH / HAPUS) ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 🚀 SINKRONISASI: Ambil userId dan productId langsung dari Body JSON pembawa data
    const { userId, productId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID wajib disertakan.' },
        { status: 400 }
      );
    }

    // Periksa apakah produk tersebut sudah ada di wishlist user
    const existingWishlist = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingWishlist) {
      // JIKA SUDAH ADA: Hapus dari wishlist
      await prisma.wishlist.delete({
        where: {
          id: existingWishlist.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produk berhasil dihapus dari wishlist',
        isWishlisted: false,
      }, { status: 200 });
    } else {
      // JIKA BELUM ADA: Tambahkan ke wishlist
      await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Produk berhasil ditambahkan ke wishlist',
        isWishlisted: true,
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error POST Wishlist:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}