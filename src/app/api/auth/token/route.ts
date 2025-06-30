import { TUser } from '@/features/auth/data/type';
import { storeRefreshToken, storeToken, storeUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const resData = {
    accessToken: (await cookies()).get('accessToken')?.value,
    refreshToken: (await cookies()).get('refreshToken')?.value,
    refreshTokenExpire: (await cookies()).get('refreshTokenExpire')?.value,
  };

  return new Response(JSON.stringify(resData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request: Request) {
  const res = await request.json();
  const refreshToken = (await cookies()).get('refreshToken')?.value;
  const refreshTokenExpire = (await cookies()).get('refreshTokenExpire')?.value;
  const user = JSON.parse((await cookies()).get('user')?.value ?? '{}') as TUser;

  if (!refreshToken || !refreshTokenExpire || res.key !== 'REFRESH') return Response.json({});

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${refreshToken}`,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/portal/auth/refresh`, {
    method: 'POST',
    headers,
  });

  const awaitedResponse = await response.json();

  if (awaitedResponse) {
    storeToken({
      token: awaitedResponse.token || '',
      remember: !!awaitedResponse.refreshTokenExpires,
      refreshTokenExpires: Number(awaitedResponse.refreshTokenExpires),
    });
    storeRefreshToken({
      token: awaitedResponse.refreshToken || '',
      remember: !!awaitedResponse.refreshTokenExpires,
      refreshTokenExpires: Number(awaitedResponse.refreshTokenExpires),
    });
    storeUser({
      user,
      remember: !!awaitedResponse.refreshTokenExpires,
      refreshTokenExpires: Number(awaitedResponse.refreshTokenExpires),
    });
  }

  return Response.json({ res });
}
