import { TLoginPayLoad, TLoginResponse } from '@/features/auth/data/type';
import { storeRefreshToken, storeToken, storeUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body: TLoginPayLoad = await request.json();
    
    // Call the external API for authentication
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/portal/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data: TLoginResponse = await response.json();

    // Store tokens and user data in cookies
    await Promise.all([
      storeToken({
        token: data.token,
        remember: true,
        refreshTokenExpires: data.refreshTokenExpires,
      }),
      storeRefreshToken({
        token: data.refreshToken,
        remember: true,
        refreshTokenExpires: data.refreshTokenExpires,
      }),
      storeUser({
        user: data.user,
        remember: true,
        refreshTokenExpires: data.refreshTokenExpires,
      }),
    ]);

    return NextResponse.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 