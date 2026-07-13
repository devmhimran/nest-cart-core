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
  '/dashboard/products': [UserRole.ADMIN],
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

function findMatchedRoute(pathname: string): string | undefined {
  return Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => {
      if (route === '/dashboard') {
        return pathname === route;
      }
      return pathname === route || pathname.startsWith(`${route}/`);
    });
}

function handleOfflineFallback(request: NextRequest, pathname: string) {
  const cachedRoleStr = request.cookies.get('user_role')?.value;

  if (cachedRoleStr !== undefined) {
    const cachedRole = Number(cachedRoleStr) as UserRole;
    const matchedRoute = findMatchedRoute(pathname);

    if (matchedRoute) {
      const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
      if (allowedRoles.includes(cachedRole)) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

function getSafeRedirectUrl(request: NextRequest): URL {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  let target = '/dashboard';
  if (
    callbackUrl &&
    callbackUrl.startsWith('/') &&
    !callbackUrl.startsWith('//')
  ) {
    target = callbackUrl;
  }
  return new URL(target, request.url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookies = request.headers.get('cookie') ?? '';
  const hasSessionCookie =
    cookies.includes('better-auth.session_token') ||
    cookies.includes('__Secure-better-auth.session_token') ||
    cookies.includes('session_token');

  if (!hasSessionCookie) {
    if (pathname === '/signin') {
      return NextResponse.next();
    }
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    const res = await getSession({
      fetchOptions: {
        headers: {
          cookie: cookies,
        },
      },
    });

    const session = res?.data;
    const authError = res?.error;

    if (authError) {
      const status = authError.status;
      const isNetworkOrServerError = !status || status >= 500;

      if (isNetworkOrServerError) {
        if (pathname === '/signin') {
          return NextResponse.redirect(getSafeRedirectUrl(request));
        }
        return handleOfflineFallback(request, pathname);
      }

      if (pathname === '/signin') {
        const response = NextResponse.next();
        response.cookies.delete('user_role');
        return response;
      }
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (!session) {
      if (pathname === '/signin') {
        const response = NextResponse.next();
        response.cookies.delete('user_role');
        return response;
      }
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const userRole = session.user.role as UserRole;

    if (pathname === '/signin') {
      const response = NextResponse.redirect(getSafeRedirectUrl(request));
      response.cookies.set('user_role', String(userRole), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    const matchedRoute = findMatchedRoute(pathname);

    if (!matchedRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const response = NextResponse.next();
    response.cookies.set('user_role', String(userRole), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    if (pathname === '/signin') {
      return NextResponse.redirect(getSafeRedirectUrl(request));
    }
    return handleOfflineFallback(request, pathname);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin'],
};
