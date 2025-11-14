import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale } from './lib/i18n';

/**
 * Middleware to protect routes and add security headers
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co;"
  );

  // Ensure locale cookie is set (for client-side use)
  const localeCookie = request.cookies.get('locale');
  if (!localeCookie) {
    response.cookies.set('locale', defaultLocale, { path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  // Protect admin routes - redirect to login if not authenticated
  // Note: Actual authentication check happens in the page component
  // This is just a basic path check
  if (pathname.startsWith('/admin')) {
    // Let the page component handle authentication with server-side checks
    return response;
  }

  // Protect authenticated routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/orders',
    '/messages',
    '/listings/create',
    '/checkout',
    '/cart-checkout',
    '/cart',
    '/notifications',
    '/disputes',
    '/change-password',
    '/seller-onboarding',
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Let the page component handle authentication
    // We can't check auth tokens in middleware easily with Supabase
    // So we rely on page-level checks
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

