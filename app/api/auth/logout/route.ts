export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Clear the JWT cookie
  response.cookies.set('cms_auth_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
