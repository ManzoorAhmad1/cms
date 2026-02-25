import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'verde-cms-super-secret-2024-change-this';

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (err) {
    console.log('JWT Verify Error:', err instanceof Error ? err.message : 'Unknown error');
    console.log('JWT_SECRET length:', JWT_SECRET.length);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow API auth routes (logout)
  if (pathname.startsWith('/api/auth')) return NextResponse.next();

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/login';
  const token = request.cookies.get('cms_auth_token')?.value;
  
  // Debug: log all cookies received
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => c.name).join(', '));
  console.log('Middleware - Path:', pathname, 'Token exists:', !!token, 'Token length:', token?.length || 0);

  const isAuthenticated = token ? await verifyToken(token) : false;
  
  console.log('Auth result:', isAuthenticated);

  // Not logged in → redirect to login
  if (!isAuthenticated && !isLoginPage) {
    console.log('Redirecting to login - not authenticated');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in → redirect away from login
  if (isAuthenticated && isLoginPage) {
    console.log('Redirecting to dashboard - already authenticated');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
