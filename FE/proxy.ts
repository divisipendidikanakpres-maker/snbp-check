import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/beranda'];
const publicOnlyRoutes = ['/', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL('/beranda', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
