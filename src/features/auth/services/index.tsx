import API from '@/lib/service';
import {  handleLogout, TAuthToken } from '@/lib/service/utility';
import { TLoginPayLoad, TLoginResponse, TRefreshTokenPayLoad, TUser } from '../data/type';

class AuthService {
  private static basePath = '/api/v1/admin/auth';

  static login = (payload: TLoginPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePath}`, payload);
  };

  static refreshToken = (config?: TRefreshTokenPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePath}/refresh`, {}, config);
  };

  static getTokenFromCookie = async (): Promise<TAuthToken> => {
    const res = await fetch('/api/auth/token');

    if (!res.ok) {
      await handleLogout();
      throw new Error('Failed to fetch token');
    }
    const resData = await res.clone().json();

    return resData;
  };

  static getMeFromCookie = async (): Promise<TUser> => {
    const res = await fetch('/api/auth/me');

    if (!res.ok) {
      await handleLogout();
      throw new Error('Failed to get me');
    }

    const resData = await res.clone().json();

    return JSON.parse(resData);
  };
}

export default AuthService;
