import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/', '/library', '/login'],
};

export const middleware = (request: NextRequest) => {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/library');
  const userIsLoggedIn = !!sessionCookie;

  if (!userIsLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (userIsLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL('/library', request.url));
  }

  return NextResponse.next();
};
