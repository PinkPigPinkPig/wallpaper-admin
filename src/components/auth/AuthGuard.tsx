'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log('AuthGuard effect triggered:', {
      loading,
      isAuthenticated,
      pathname,
      authChecked
    });

    if (!loading) {
      // Add a small delay to ensure localStorage is properly set
      const timer = setTimeout(() => {
        console.log('AuthGuard checking authentication after delay');
        
        // If trying to access protected routes without authentication
        if (pathname.startsWith('/admin/') && !isAuthenticated) {
          console.log('Redirecting to signin - not authenticated for admin route');
          router.push('/auth/signin');
          return;
        }

        // If authenticated and trying to access signin page, redirect to admin
        if (pathname.startsWith('/auth/') && isAuthenticated) {
          console.log('Redirecting to admin - authenticated user on auth page');
          router.push('/admin/wallpaper');
          return;
        }

        // If on root and authenticated, redirect to admin
        if (pathname === '/' && isAuthenticated) {
          console.log('Redirecting to admin - authenticated user on root');
          router.push('/admin/wallpaper');
          return;
        }

        setAuthChecked(true);
      }, 200); // 200ms delay

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, pathname, router, authChecked]);

  // Show loading while checking authentication
  if (loading || !authChecked) {
    console.log('AuthGuard showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  console.log('AuthGuard rendering children:', { isAuthenticated, pathname });
  return <>{children}</>;
}; 