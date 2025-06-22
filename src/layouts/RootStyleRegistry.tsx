'use client';
import React from 'react';
import { Avatar, Breadcrumb, Button, Dropdown, Flex, Layout, MenuProps, Typography, Tooltip } from 'antd';
import Sidebar from './Sidebar';
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSetHeaderContent } from '@/context/header/HeaderProvider';
import { usePathname } from 'next/navigation';
import Show from '@/components/ui/Show';

const ToastMessage = dynamic(() => import('@/components/ui/ToastMessage'), { ssr: false });

const { Text } = Typography;

const { Header, Content } = Layout;

type TProps = {
  children: React.ReactNode;
};

const items: MenuProps['items'] = [
  {
    label: (
      <Link href={'/'}>
        <Flex style={{ width: 172, height: 40 }} align="center" justify="start">
          <UserOutlined className="h-3 w-3 mr-1" /> <Text>My Profile</Text>
        </Flex>
      </Link>
    ),
    key: 'MY_PROFILE',
  },
  {
    label: (
      <Flex style={{ width: 172, height: 40 }} align="center" justify="start">
        <LogoutOutlined className="h-3 w-3 mr-1" /> <Text>Log out</Text>
      </Flex>
    ),
    key: 'LOG_OUT',
  },
];

const RootStyleRegistry = ({ children }: Readonly<TProps>) => {
  const { pageTitle, breadcrumbs } = useSetHeaderContent();
  const path = usePathname();
  const isPrintFormPage = path.includes('print-form');

  const onSelectMenu: MenuProps['onClick'] = (e) => {
    if (e.key === 'LOG_OUT') {
      // handleLogout();
    }
  };

  return (
      <Show when={!isPrintFormPage} fallback={<Layout style={{ minHeight: '100vh' }}>{children}</Layout>}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar />
          <Layout>
            <Header className="flex sticky top-0 items-center justify-between px-0 bg-white z-20 h-16 shadow-header px-4">
              <Text className="text-lg">{pageTitle ?? ''}</Text>
              <Dropdown menu={{ items, onClick: onSelectMenu }} trigger={['click']}>
                <Button type="text" className="flex items-center gap-2 h-full">
                  <Avatar size={48} icon={<UserOutlined />} />
                  <Flex vertical align="flex-start">
                    <Tooltip placement="topRight" title={"Admin"}>
                      <Text strong style={{ maxWidth: '200px' }} className="text-sm !text-white" ellipsis>
                      Admin
                      </Text>
                    </Tooltip>

                    <Text className="text-sm !text-white">Admin</Text>
                  </Flex>
                  <DownOutlined size={16} />
                </Button>
              </Dropdown>
            </Header>
            <Content className="mx-4 mt-0 mb-6">
              <Breadcrumb items={breadcrumbs} className="my-4" />
              {children}
            </Content>
          </Layout>

          <ToastMessage />
        </Layout>
      </Show>
  );
};

export default RootStyleRegistry;
