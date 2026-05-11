// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // 1. Jika belum login (tidak ada cookie), lempar ke halaman login
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Jika sudah login tapi bukan ADMIN, baru lempar ke unauthorized
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};