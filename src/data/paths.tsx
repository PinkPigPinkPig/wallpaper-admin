'use client';

import {
  ReadOutlined,
  SolutionOutlined,
  TableOutlined,
} from '@ant-design/icons';

export type IMenuItem = {
  key: string;
  label: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  children?: IMenuItem[];
};

export const menus: IMenuItem[] = [
  {
    key: '/admin/wallpaper',
    title: 'Wallpaper',
    label: 'Wallpaper',
    icon: <ReadOutlined />,
  },
  {
    key: '/admin/category',
    title: 'Category',
    label: 'Category',
    icon: <SolutionOutlined />,
  },
  {
    key: '/admin/menu',
    title: 'Menu',
    label: 'Menu',
    icon: <TableOutlined />,
  },
];
