import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // Call backend auth API
    const backendRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Galat email ya password' },
        { status: 401 }
      );
    }

    // Store JWT in secure httpOnly cookie
    const response = NextResponse.json({ success: true, admin: data.admin });
    response.cookies.set('cms_auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error('CMS Login error:', err);
    return NextResponse.json({ success: false, message: 'Backend se connect nahi ho saka' }, { status: 500 });
  }
}

