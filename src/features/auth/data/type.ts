export type TUser = {
  id: string;
  username: string;
  createdAt: string;
};

export type TLoginPayLoad = {
  username: string;
  password: string;
};

export type TLoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: TUser;
};

export type TRefreshTokenPayLoad = {
  headers?: HeadersInit;
};

export type TSendEmailPayLoad = {
  email: string;
};

export type TVerifyEmailResponse = {
  message: string;
};

export type TResetPasswordPayload = {
  email: string;
  otp: string;
  password: string;
};

export type TCheckBlockOtpResponse = {
  isBlocked: boolean;
  remainingTime: number;
};

export type TAuthentication = {
  id: string;
  name: string;
  path: string;
  method: string;
};

export type PermissionRole = 'admin' | 'user';
