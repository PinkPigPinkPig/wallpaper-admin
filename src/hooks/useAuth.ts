import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { TUser } from '@/features/auth/data/type';
import { storeToken, storeUser, clearToken, getUser, isAuthenticated } from '@/lib/auth/localStorage';

export const useAuth = () => {
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      console.log('checkAuth called');
      const userData = getUser();
      const authenticated = isAuthenticated();
      
      console.log('checkAuth result:', { userData, authenticated });
      
      if (userData && authenticated) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('Login attempt for:', username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', { 
        ok: response.ok, 
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        hasUser: !!data.user 
      });

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store tokens and user data in localStorage
      if (data.accessToken && data.refreshToken) {
        console.log('Storing tokens in localStorage');
        storeToken({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          remember: true,
        });
      }

      if (data.user) {
        console.log('Storing user in localStorage');
        storeUser({
          user: data.user,
          expiresIn: data.expiresIn,
          remember: true,
        });
      }

      // Update state and wait a bit before navigation to ensure localStorage is set
      setUser(data.user);
      message.success('Login successful!');
      
      console.log('Login successful, navigating to admin/wallpaper');
      
      // Small delay to ensure localStorage is properly set
      setTimeout(() => {
        router.push('/admin/wallpaper');
      }, 100);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      message.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearToken();
      setUser(null);
      message.success('Logged out successfully');
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Logout failed');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const authState = isAuthenticated(); // Use the actual localStorage check instead of state
  console.log('useAuth hook state:', { user, loading, isAuthenticated: authState });

  return {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated: authState,
  };
}; 