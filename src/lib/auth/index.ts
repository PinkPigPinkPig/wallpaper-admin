'use server';
import { TUser } from '@/features/auth/data/type';
import { cloneDeep } from 'lodash';
import { cookies } from 'next/headers';

type TStoreTokenRequest = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  remember?: boolean;
};

type TStoreUserRequest = {
  user: TUser;
  expiresIn?: number;
  remember?: boolean;
};

type TStoreAllowedMenuPaths = {
  paths: string[];
  expiresIn?: number;
  remember?: boolean;
};

export async function storeUser(request: TStoreUserRequest) {
  const accessToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
  };

  if (request.remember && request.expiresIn) {
    accessToken.expires = request.expiresIn;
  }

  const cookieStore = await cookies();
  cookieStore.set('user', JSON.stringify(request.user), accessToken);
}

export async function storeToken(request: TStoreTokenRequest) {
  console.log('storeToken called with:', { 
    hasAccessToken: !!request.accessToken,
    hasRefreshToken: !!request.refreshToken,
    expiresIn: request.expiresIn,
    remember: request.remember 
  });

  const accessToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    // httpOnly: true, // Removed for debugging - access token will be visible in browser
  };

  if (request.remember && request.expiresIn) {
    accessToken.expires = request.expiresIn;
  }

  const cookieStore = await cookies();
  cookieStore.set('accessToken', request.accessToken, accessToken);
  console.log('accessToken cookie set');
  
  // Add a debug cookie for browser visibility (only in development)
  if (process.env.NODE_ENV === 'development') {
    const debugToken: Record<string, unknown> = {
      sameSite: 'strict',
      secure: false, // Allow HTTP in development
    };
    
    if (request.remember && request.expiresIn) {
      debugToken.expires = request.expiresIn;
    }
    
    cookieStore.set('debug_accessToken', request.accessToken, debugToken);
    console.log('debug_accessToken cookie set');
  }
}

export async function storeRefreshToken(request: TStoreTokenRequest) {
  const refreshToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
  };

  if (request.remember && request.expiresIn) {
    const refreshTokenExpire = cloneDeep(refreshToken);
    refreshToken.expires = request.expiresIn;
    refreshTokenExpire.expires = request.expiresIn;
    const cookieStore = await cookies();
    cookieStore.set('refreshTokenExpire', request.expiresIn.toString(), refreshTokenExpire);
  }

  const cookieStore = await cookies();
  cookieStore.set('refreshToken', request.refreshToken, refreshToken);
}

export async function storeAllowedMenuPaths(request: TStoreAllowedMenuPaths) {
  const allowedMenuPaths: Record<string, unknown> = {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
  };

  if (request.remember) {
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    allowedMenuPaths.expires = next30Days;
  }

  const cookieStore = await cookies();
  cookieStore.set('allowedMenuPaths', JSON.stringify(request.paths), allowedMenuPaths);
}

export async function clearToken() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('refreshTokenExpire');
  cookieStore.delete('user');
  cookieStore.delete('allowedMenuPaths');
  
  // Clear debug cookie if it exists
  if (process.env.NODE_ENV === 'development') {
    cookieStore.delete('debug_accessToken');
  }
}
