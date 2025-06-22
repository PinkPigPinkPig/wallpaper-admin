import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname || '';

  // Allow auth routes
  if (pathName.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Redirect root to wallpaper page
  if (pathName === '/') {
    return NextResponse.redirect(new URL('/admin/wallpaper', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
