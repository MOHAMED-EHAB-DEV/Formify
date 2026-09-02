import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/lib/session';

const PROTECTED_ROUTES = ['/dashboard', '/forms', '/settings'];
const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyToken(token);
    isAuthenticated = payload !== null;
  }

  if (isProtected && !isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/forms/:path*', '/settings/:path*', '/sign-in', '/sign-up'],
};
