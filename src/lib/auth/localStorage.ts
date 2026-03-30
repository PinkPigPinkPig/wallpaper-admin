'use client';

import { TUser } from '@/features/auth/data/type';

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

export function storeUser(request: TStoreUserRequest) {
  const userData = {
    user: request.user,
    expiresAt: request.expiresIn ? Date.now() + (request.expiresIn * 1000) : null,
  };
  
  localStorage.setItem('user', JSON.stringify(userData));
  console.log('User stored in localStorage:', userData);
}

export function storeToken(request: TStoreTokenRequest) {
  console.log('storeToken called with:', { 
    hasAccessToken: !!request.accessToken,
    hasRefreshToken: !!request.refreshToken,
    expiresIn: request.expiresIn,
    remember: request.remember 
  });

  const tokenData = {
    accessToken: request.accessToken,
    refreshToken: request.refreshToken,
    expiresAt: request.expiresIn ? Date.now() + (request.expiresIn * 1000) : null,
  };
  
  localStorage.setItem('tokens', JSON.stringify(tokenData));
  console.log('tokens stored in localStorage:', { 
    hasAccessToken: !!tokenData.accessToken,
    hasRefreshToken: !!tokenData.refreshToken,
    expiresAt: tokenData.expiresAt,
    currentTime: Date.now(),
    willExpireAt: tokenData.expiresAt
  });
}

export function storeRefreshToken(request: TStoreTokenRequest) {
  const refreshTokenData = {
    refreshToken: request.refreshToken,
    expiresAt: request.expiresIn ? Date.now() + (request.expiresIn * 1000) : null,
  };
  
  localStorage.setItem('refreshToken', JSON.stringify(refreshTokenData));
}

export function storeAllowedMenuPaths(request: TStoreAllowedMenuPaths) {
  const menuData = {
    paths: request.paths,
    expiresAt: request.expiresIn ? Date.now() + (request.expiresIn * 1000) : null,
  };
  
  localStorage.setItem('allowedMenuPaths', JSON.stringify(menuData));
}

export function getToken(): { accessToken: string; refreshToken: string; expiresAt: number | null } | null {
  if (typeof window === 'undefined') return null;

  try {
    const tokenData = localStorage.getItem('tokens');
    if (!tokenData) {
      console.log('No tokens found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(tokenData);
    
    // Check if token is expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      console.log('Token expired, removing from localStorage. Current time:', Date.now(), 'Expires at:', parsed.expiresAt);
      localStorage.removeItem('tokens');
      return null;
    }
    
    console.log('Token retrieved from localStorage:', { 
      hasAccessToken: !!parsed.accessToken,
      hasRefreshToken: !!parsed.refreshToken,
      expiresAt: parsed.expiresAt,
      currentTime: Date.now(),
      isExpired: parsed.expiresAt ? Date.now() > parsed.expiresAt : false
    });
    
    return parsed;
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
}

export function getRefreshToken(): { refreshToken: string; expiresAt: number | null } | null {
  if (typeof window === 'undefined') return null;

  try {
    const refreshTokenData = localStorage.getItem('refreshToken');
    if (!refreshTokenData) return null;
    
    const parsed = JSON.parse(refreshTokenData);
    
    // Check if refresh token is expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem('refreshToken');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error getting refresh token from localStorage:', error);
    return null;
  }
}

export function getUser(): TUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('No user found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(userData);
    
    // Check if user data is expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      console.log('User data expired, removing from localStorage. Current time:', Date.now(), 'Expires at:', parsed.expiresAt);
      localStorage.removeItem('user');
      return null;
    }
    
    console.log('User retrieved from localStorage:', parsed.user);
    return parsed.user;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
}

export function getAllowedMenuPaths(): string[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const menuData = localStorage.getItem('allowedMenuPaths');
    if (!menuData) return null;
    
    const parsed = JSON.parse(menuData);
    
    // Check if menu data is expired
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem('allowedMenuPaths');
      return null;
    }
    
    return parsed.paths;
  } catch (error) {
    console.error('Error getting allowed menu paths from localStorage:', error);
    return null;
  }
}

export function clearToken() {
  if (typeof window === 'undefined') return;

  console.log('Clearing all authentication data from localStorage');
  localStorage.removeItem('tokens');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('allowedMenuPaths');
}

export function isAuthenticated(): boolean {
  const token = getToken();
  const authenticated = !!token?.accessToken;
  console.log('isAuthenticated check:', authenticated);
  return authenticated;
} 