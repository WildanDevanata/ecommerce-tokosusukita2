import { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

export function middleware(
  request: NextRequest
) {
  const role =
    request.cookies.get('role')
      ?.value;

  const pathname =
    request.nextUrl.pathname;

  if (
    pathname.startsWith('/admin')
  ) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(
        new URL(
          '/unauthorized',
          request.url
        )
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};