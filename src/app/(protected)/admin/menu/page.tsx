'use client'

import Section from '@/components/ui/Section';
import { useSetHeaderContent } from '@/context/header/HeaderProvider';
import MenuTable from '@/features/menu/components/MenuTable';
import MenuTableFilter from '@/features/menu/components/MenuTableFilter';
import { Flex } from 'antd';
import React, { useEffect } from 'react'

const PageMenu = () => {
  const { setPageTitle } = useSetHeaderContent();
  useEffect(() => {
    setPageTitle("Menu");
  }, [setPageTitle]);
  return (
    <Section>
      <Flex
        className="bg-white"
        gap={32}
        vertical
      >
        <MenuTableFilter />
        <MenuTable />
      </Flex>
    </Section>
  );
}

export default PageMenu