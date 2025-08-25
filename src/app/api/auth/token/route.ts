export async function GET() {
  // For GET requests, we'll return a message indicating this endpoint expects POST with tokens
  return Response.json({ 
    message: 'This endpoint expects a POST request with tokens in the body' 
  }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken, key } = body;

    if (!refreshToken || key !== 'REFRESH') {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

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
      // Return the new tokens to be stored in localStorage by the client
      return Response.json({
        accessToken: awaitedResponse.token || awaitedResponse.accessToken || '',
        refreshToken: awaitedResponse.refreshToken || '',
        expiresIn: Number(awaitedResponse.refreshTokenExpires || awaitedResponse.expiresIn),
      });
    }

    return Response.json({ error: 'Token refresh failed' }, { status: 401 });
  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}
