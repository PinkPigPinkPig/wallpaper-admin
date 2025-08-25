import API from '@/lib/service';
import { handleLogout, TAuthToken } from '@/lib/service/utility';
import { TLoginPayLoad, TLoginResponse, TRefreshTokenPayLoad, TUser } from '../data/type';
import { getToken, getUser } from '@/lib/auth/localStorage';

class AuthService {
  private static basePath = '/auth';

  static login = (payload: TLoginPayLoad) => {
    console.log("payload", payload);
    return API.post<TLoginResponse>(`${AuthService.basePath}/login`, payload);
  };

  static refreshToken = (config?: TRefreshTokenPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePath}/refresh`, {}, config);
  };

  static getTokenFromCookie = async (): Promise<TAuthToken> => {
    const token = getToken();
    if (!token) {
      await handleLogout();
      throw new Error('No token found');
    }
    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresIn: token.expiresAt?.toString(),
    };
  };

  static getMeFromCookie = async (): Promise<TUser> => {
    const user = getUser();
    if (!user) {
      await handleLogout();
      throw new Error('No user found');
    }
    return user;
  };
}

export default AuthService;
