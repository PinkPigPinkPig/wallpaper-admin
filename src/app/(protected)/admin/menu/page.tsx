'use client'

import Section from '@/components/ui/Section';
import { useSetHeaderContent } from '@/context/header/HeaderProvider';
import MenuTable from '@/features/menu/components/MenuTable';
import MenuTableFilter from '@/features/menu/components/MenuTableFilter';
import { Button, Flex } from 'antd';
import React, { useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const PageMenu = () => {
  const { setPageTitle } = useSetHeaderContent();
  const router = useRouter();

  useEffect(() => {
    setPageTitle("Menu");
  }, [setPageTitle]);

  const handleClickCreateButton = () => {
    router.push("/admin/menu/create");
  };

  return (
    <div>
      <Section>
        <Flex
          className="bg-white"
          gap={32}
          vertical
        >
          <div className="flex justify-between">
            <MenuTableFilter />
            <Button
              type="primary"
              onClick={handleClickCreateButton}
            >
              <Flex gap={8}>
                <PlusOutlined />
                <span>
                  Create Menu
                </span>
              </Flex>
            </Button>
          </div>
          <MenuTable />
        </Flex>
      </Section>
    </div>
  );
}

export default PageMenu