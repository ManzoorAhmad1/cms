import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('cms_auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized — pehle login karen' }, { status: 401 });
    }

    const body = await req.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // Forward request to backend with JWT
    const backendRes = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Update failed' },
        { status: backendRes.status }
      );
    }

    // Update cookie with fresh token (in case email changed)
    const response = NextResponse.json({ success: true, message: data.message });
    if (data.token) {
      response.cookies.set('cms_auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
