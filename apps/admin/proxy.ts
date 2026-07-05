import { UserRole } from './lib/enums';
import { getSession } from './lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MODERATOR],
  '/dashboard/media-library': [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  ],
  '/dashboard/products': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/orders': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/categories': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/sub-categories': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/colors': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/sizes': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/promo-code': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/customers': [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  ],
  '/dashboard/users': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  '/dashboard/profile': [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const { data: session } = await getSession({
      fetchOptions: {
        headers: {
          cookie: request.headers.get('cookie') ?? '',
        },
      },
    });

    if (!session) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
      .sort((a, b) => b.length - a.length)
      .find((route) => {
        if (route === '/dashboard') {
          return pathname === route;
        }

        return pathname === route || pathname.startsWith(`${route}/`);
      });

    if (!matchedRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];

    if (!allowedRoles.includes(session.user.role as UserRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
