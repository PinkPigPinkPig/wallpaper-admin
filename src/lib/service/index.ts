import { AUTH, fetchWithTimeout, handleLogout, parseJSON, handleRefreshToken } from './utility';
import { Errors } from '@/data/constants';
import AuthService from '@/features/auth/services';
import queryClient from '../react-query/query.instance';
import { postMessageHandler } from '@/components/ui/ToastMessage';

class API {
  private static baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  private static timeout = parseInt(process.env.NEXT_PUBLIC_API_TIME_OUT ?? '5000', 10);
  private static abortControllers: Record<string, AbortController> = {};

  static configure(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  static async getHeaders(url: string, customHeaders: HeadersInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Don't add authorization header for auth endpoints (login, refresh, etc.)
    // Only add for protected endpoints
    const isAuthEndpoint = url.includes('auth/login') || url.includes('auth/refresh');
    const isProtectedEndpoint = !url.includes('auth') || url.includes('auth/me');
    
    if (!isAuthEndpoint && isProtectedEndpoint) {
      try {
        const authToken = await queryClient.fetchQuery({
          queryKey: [AUTH.TOKEN],
          queryFn: () => AuthService.getTokenFromCookie(),
        });
        headers['Authorization'] = `Bearer ${authToken.accessToken}`;
      } catch {
        // If no token is available, don't add authorization header
        console.log('No auth token available for:', url);
      }
    }

    return { ...headers, ...customHeaders };
  }

  private static async request<R>(url: string, options: RequestInit, stopRefresh = false): Promise<R> {
    const response = await fetchWithTimeout(url, options, API.timeout);

    const data = await parseJSON(response);
    if (!response.ok) {
      if (data.status !== 401 && (!data.errorCode || !Errors[data.errorCode as keyof typeof Errors])) {
        postMessageHandler({
          text: data.message || 'Something went wrong',
          type: 'error',
          id: crypto.randomUUID()
        });
      }

      if (stopRefresh) {
        handleLogout();
        throw new Error('Unauthorized');
      }

      if (
        data.status === 401 &&
        data.errorCode === 'TOKEN_EXPIRED' &&
        (!url.includes('admin/auth') || url.includes('admin/auth/me'))
      ) {
        const response = await handleRefreshToken();
        const headers: HeadersInit = options.headers ?? { Authorization: '' };
        headers['Authorization' as keyof HeadersInit] = `Bearer ${response?.token}`;
        if (document && localStorage.getItem('fingerprint')) {
          headers['X-Visitor-ID' as keyof HeadersInit] = localStorage.getItem('fingerprint') || '';
        }
        return API.request(url, { ...options, headers }, true);
      }

      throw data;
    }

    return data;
  }

  static getWithAbort = async <R>(url: string, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const urlPath = url.split('?')[0] ?? url;
    if (API.abortControllers[urlPath]) {
      API.abortControllers[urlPath]!.abort();
      delete API.abortControllers[urlPath];
    }

    const controller = new AbortController();
    API.abortControllers[urlPath] = controller;

    const configHeader = await API.getHeaders(url, headers);

    const options: RequestInit = {
      method: 'GET',
      headers: configHeader,
      signal: controller.signal,
      ...config,
    };

    try {
      return await API.request<R>(`${API.baseURL}${url}`, options);
    } finally {
      delete API.abortControllers[url];
    }
  };

  static getNormally = async <R>(url: string, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const configHeader = await API.getHeaders(url, headers);
    const options: RequestInit = {
      method: 'GET',
      headers: configHeader,
      ...config,
    };

    return API.request<R>(`${API.baseURL}${url}`, options);
  };

  static get = <R>(url: string, config: RequestInit = {}, enableAbort = true): Promise<R> => {
    if (enableAbort) return this.getWithAbort(url, config);

    return this.getNormally(url, config);
  };

  static delete = async <R>(url: string, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const configHeader = await API.getHeaders(url, headers);
    const options: RequestInit = {
      method: 'DELETE',
      headers: configHeader,
      ...config,
    };

    return API.request<R>(`${API.baseURL}${url}`, options);
  };

  static post = async <R>(url: string, data: unknown, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const configHeader = await API.getHeaders(url, headers);

    const options: RequestInit = {
      method: 'POST',
      headers: configHeader,
      body: JSON.stringify(data),
      ...config,
    };

    return API.request<R>(`${API.baseURL}${url}`, options);
  };

  static put = async <R>(url: string, data: unknown, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const configHeader = await API.getHeaders(url, headers);
    const options: RequestInit = {
      method: 'PUT',
      headers: configHeader,
      body: JSON.stringify(data),
      ...config,
    };

    return API.request<R>(`${API.baseURL}${url}`, options);
  };

  static patch = async <R>(url: string, data: unknown, { headers, ...config }: RequestInit = {}): Promise<R> => {
    const configHeader = await API.getHeaders(url, headers);
    const options: RequestInit = {
      method: 'PATCH',
      headers: configHeader,
      body: JSON.stringify(data),
      ...config,
    };

    return API.request<R>(`${API.baseURL}${url}`, options);
  };

  static download = async (url: string, { headers, ...config }: RequestInit = {}): Promise<void> => {
    const configHeader = await API.getHeaders(url, headers);
    const options: RequestInit = {
      method: 'GET',
      headers: configHeader,
      ...config,
    };

    try {
      const response = await fetch(`${API.baseURL}${url}`, options);

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;

      // Extract the filename from the response header
      const contentDisposition = response.headers.get('content-disposition')?.match(/filename="(.+)"/) || [
        null,
        `booking-files-${new Date().getTime()}`,
      ];
      const filename = contentDisposition[1];

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };
}

export default API;
