import { TLoginPayLoad, TLoginResponse } from '@/features/auth/data/type';
import API from '@/lib/service';

export async function POST(request: Request) {
  try {
    const body: TLoginPayLoad = await request.json();
    console.log('Login request received:', { username: body.username });
    
    // Call the external API for login
    console.log('Calling external API...');
    const response = await API.post<TLoginResponse>('/auth/login', body);
    console.log('External API response received:', { 
      hasAccessToken: !!response.accessToken,
      hasRefreshToken: !!response.refreshToken,
      hasUser: !!response.user,
      accessTokenLength: response.accessToken?.length || 0,
      refreshTokenLength: response.refreshToken?.length || 0
    });
    
    console.log('Login successful, returning data for localStorage storage');

    return Response.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Login failed' },
      { status: 401 }
    );
  }
} 