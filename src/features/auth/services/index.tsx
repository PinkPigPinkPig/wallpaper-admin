import API from '@/lib/service';
import { fetchWithTimeout, handleLogout, TAuthToken } from '@/lib/service/utility';
import { TUser } from '../data/type';

class AuthService {
  private static basePath = '/api/v1/admin/auth';
  private static basePortalPath = '/api/v1/portal/auth';

  static login = (payload: TLoginPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePortalPath}`, payload);
  };

  static refreshToken = (config?: TRefreshTokenPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePath}/refresh`, {}, config);
  };

  static sendEmail = (payload: TSendEmailPayLoad) => {
    return API.post(`${AuthService.basePath}/forgot-pwd`, payload);
  };

  static sendEmailForgot = (payload: TSendEmailPayLoad) => {
    return API.post(`${AuthService.basePortalPath}/forgot`, payload);
  };

  static reSendEmailForgot = (payload: TSendEmailPayLoad) => {
    return API.post(`${AuthService.basePortalPath}/resend`, { ...payload, isForgot: true });
  };

  static forgotPwdVerify = (payload: TSendEmailPayLoad) => {
    return API.post<TVerifyEmailResponse>(`${AuthService.basePortalPath}/forgot/verify`, payload);
  };

  static resetPwd = (payload: TResetPasswordPayload) => {
    return API.post(`${AuthService.basePortalPath}/reset-password`, payload);
  };

  static resendOtp = (payload: TSendEmailPayLoad) => {
    return API.post(`${AuthService.basePortalPath}/resend`, payload);
  };

  static verifyOtp = (payload: TSendEmailPayLoad) => {
    return API.post<TLoginResponse>(`${AuthService.basePortalPath}/verify`, payload);
  };

  static checkBlockSendOtp = (payload: TSendEmailPayLoad) => {
    return API.post<TCheckBlockOtpResponse>(`${AuthService.basePath}/email/ttl-block-resend-otp`, payload);
  };

  static checkBlockSendForgotPwdOtp = (payload: TSendEmailPayLoad) => {
    return API.post<TCheckBlockOtpResponse>(`${AuthService.basePath}/forgot/password/ttl-block-resend-otp`, payload);
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

  static getMyPermissionStorage = (): TAuthentication => {
    const permissionFromLocal: TAuthentication = JSON.parse(localStorage.getItem('permission') || '');
    const permissionFromSession: TAuthentication = JSON.parse(sessionStorage.getItem('permission') || '');

    return permissionFromLocal || permissionFromSession;
  };

  static getMyPermission = async (roles: PermissionRole[], token: string): Promise<TAuthentication[]> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    headers['Authorization'] = `Bearer ${token}`;
    if (document && localStorage.getItem('fingerprint')) {
      headers['X-Visitor-ID'] = localStorage.getItem('fingerprint') || '';
    }

    const searchParams = toQuery({ roles });
    const response = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/portal/permissions?${searchParams}`,
      { method: 'GET', headers },
      5000,
    );

    const permissions: TAuthentication[] = JSON.parse(await response.text());

    return permissions;
  };
}

export default AuthService;
