import type { Metadata } from 'next';
import RootStyleRegistry from '@/layouts/RootStyleRegistry';
import HeaderProvider from '@/context/header/HeaderProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
  title: 'Wallpaper',
  description: 'Wallpaper',
};

type TProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Readonly<TProps>) {
  return (
    <HeaderProvider>
      <RootStyleRegistry>
        <ProtectedRoute>{children}</ProtectedRoute>
      </RootStyleRegistry>
    </HeaderProvider>
  );
}
