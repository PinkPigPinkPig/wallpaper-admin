import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname || '';

  // Allow auth routes
  if (pathName.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // Check for authentication token
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If no tokens exist and trying to access protected routes, redirect to signin
  if ((!accessToken || !refreshToken) && pathName.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If authenticated and trying to access signin page, redirect to admin
  if ((accessToken && refreshToken) && pathName.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/admin/wallpaper', request.url));
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
