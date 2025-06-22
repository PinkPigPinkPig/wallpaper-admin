import type { Metadata } from 'next';
import RootStyleRegistry from '@/layouts/RootStyleRegistry';
import HeaderProvider from '@/context/header/HeaderProvider';

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
      <RootStyleRegistry>{children}</RootStyleRegistry>
    </HeaderProvider>
  );
}
