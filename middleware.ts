import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware is minimal now - auth is handled client-side with localStorage tokens
// This only handles static assets and basic routing
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow all routes - auth check happens client-side
  // Static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
