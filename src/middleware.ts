import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname || '';

  // Allow auth routes to pass through
  if (pathName.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side handle authentication
  // The middleware will pass through and let the client-side components
  // handle redirects based on localStorage authentication state
  if (pathName.startsWith('/admin/')) {
    return NextResponse.next();
  }

  // Redirect root to signin page - client will handle redirect to admin if authenticated
  if (pathName === '/') {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
