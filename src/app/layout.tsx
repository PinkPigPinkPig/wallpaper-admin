import { theme } from '@/lib/antd';
import { RqProvider } from '@/lib/react-query/rq.provider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import ToastMessageProvider from '@/components/ui/ToastMessageProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wallpaper',
  description: 'Wallpaper',
};

type TProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Readonly<TProps>) {

  return (
    <html lang="en">
      <body>
        <RqProvider>
          <AntdRegistry>
            <ConfigProvider theme={theme}>
              <AuthGuard>
                <main>{children}</main>
              </AuthGuard>
              <ToastMessageProvider />
            </ConfigProvider>
          </AntdRegistry>
        </RqProvider>
      </body>
    </html>
  );
}
