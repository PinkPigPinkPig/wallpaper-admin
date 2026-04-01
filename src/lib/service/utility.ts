import { Errors } from '@/data/constants';
import queryClient from '../react-query/query.instance';
import AuthService from '@/features/auth/services';
import { clearToken, storeToken, storeRefreshToken, storeUser } from '@/lib/auth/localStorage';
import { showToast } from '@/lib/error/toast';

export const AUTH = {
  TOKEN: 'TOKEN',
};

export interface IResponseError<T, E = Errors> {
  data: T;
  errorCode?: E;
  message?: string;
  errors: object;
  status: number;
}

export type TAuthToken = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
};

export type TData = Record<string, unknown>;

const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const parseJSON = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const handleLogout = async () => {
  showToast('unauthorized', 'Session expired. Please log in again.');
  clearToken();
  localStorage.clear();
  sessionStorage.clear();
  queryClient.invalidateQueries({ queryKey: [AUTH.TOKEN] });
  window.location.href = '/auth/signin';
};

let refreshTokenPromise: Promise<Record<string, string>> | null = null;
export const refreshToken = async (): Promise<Record<string, string>> => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = (async () => {
      try {
        queryClient.invalidateQueries({ queryKey: [AUTH.TOKEN] });
        const authToken = await queryClient.fetchQuery({
          queryKey: [AUTH.TOKEN],
          queryFn: () => AuthService.getTokenFromCookie(),
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken.refreshToken}`,
        };
        if (document && localStorage.getItem('fingerprint')) {
          headers['X-Visitor-ID'] = localStorage.getItem('fingerprint') || '';
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/portal/auth/refresh`, {
          method: 'POST',
          headers,
        });
        const awaitedResponse = await response.json();

        return awaitedResponse;
      } catch {
        handleLogout();
        return null;
      } finally {
        queryClient.invalidateQueries({ queryKey: [AUTH.TOKEN] });
        refreshTokenPromise = null; // Reset the promise after the refresh operation is complete
      }
    })();
  }

  return refreshTokenPromise;
};

const handleRefreshToken = async (): Promise<Record<string, unknown> | null> => {
  const response = await refreshToken();

  if (response) {
    const [token, me] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: [AUTH.TOKEN],
        queryFn: () => AuthService.getTokenFromCookie(),
        staleTime: 1000 * 60 * 10,
      }),
      queryClient.fetchQuery({
        queryKey: [AUTH.TOKEN],
        queryFn: () => AuthService.getMeFromCookie(),
        staleTime: 1000 * 60 * 10,
      }),
    ]);

    storeToken({
      accessToken: response.accessToken || '',
      refreshToken: response.refreshToken || '',
      expiresIn: Number(response.expiresIn),
      remember: !!token.refreshToken,
    });
    storeRefreshToken({
      accessToken: response.accessToken || '',
      refreshToken: response.refreshToken || '',
      expiresIn: Number(response.expiresIn),
      remember: !!token.refreshToken,
    });
    if (me) {
      storeUser({
        user: me,
        remember: !!token.refreshToken,
        expiresIn: Number(response.expiresIn),
      });
    }
  }

  return response;
};

export { fetchWithTimeout, parseJSON, handleLogout, handleRefreshToken };
