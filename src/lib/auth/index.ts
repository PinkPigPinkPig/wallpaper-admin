'use server';
import { TUser } from '@/features/auth/data/type';
import { cloneDeep } from 'lodash';
import { cookies } from 'next/headers';

type TStoreTokenRequest = {
  token: string;
  refreshTokenExpires?: number;
  remember?: boolean;
};

type TStoreUserRequest = {
  user: TUser;
  refreshTokenExpires?: number;
  remember?: boolean;
};

type TStoreAllowedMenuPaths = {
  paths: string[];
  refreshTokenExpires?: number;
  remember?: boolean;
};

export async function storeUser(request: TStoreUserRequest) {
  const accessToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  };

  if (request.remember && request.refreshTokenExpires) {
    accessToken.expires = request.refreshTokenExpires;
  }

  const cookieStore = await cookies();
  cookieStore.set('user', JSON.stringify(request.user), accessToken);
}

export async function storeToken(request: TStoreTokenRequest) {
  const accessToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  };

  if (request.remember && request.refreshTokenExpires) {
    accessToken.expires = request.refreshTokenExpires;
  }

  const cookieStore = await cookies();
  cookieStore.set('accessToken', request.token, accessToken);
}

export async function storeRefreshToken(request: TStoreTokenRequest) {
  const refreshToken: Record<string, unknown> = {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  };

  if (request.remember && request.refreshTokenExpires) {
    const refreshTokenExpire = cloneDeep(refreshToken);
    refreshToken.expires = request.refreshTokenExpires;
    refreshTokenExpire.expires = request.refreshTokenExpires;
    const cookieStore = await cookies();
    cookieStore.set('refreshTokenExpire', request.refreshTokenExpires.toString(), refreshTokenExpire);
  }

  const cookieStore = await cookies();
  cookieStore.set('refreshToken', request.token, refreshToken);
}

export async function storeAllowedMenuPaths(request: TStoreAllowedMenuPaths) {
  const allowedMenuPaths: Record<string, unknown> = {
    sameSite: 'strict',
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
}
