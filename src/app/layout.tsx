import { theme } from '@/lib/antd';
import { RqProvider } from '@/lib/react-query/rq.provider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';
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
              <main>{children}</main>
            </ConfigProvider>
          </AntdRegistry>
        </RqProvider>
      </body>
    </html>
  );
}
