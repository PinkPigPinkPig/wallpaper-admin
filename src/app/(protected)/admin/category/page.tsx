"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import CategoryTable from "@/features/category/components/CategoryTable";
import CategoryTableFilter from "@/features/category/components/CategoryTableFilter";
import { Flex } from "antd";
import React, { useEffect } from "react";

const PageCategory = () => {
  const { setPageTitle } = useSetHeaderContent();
  useEffect(() => {
    setPageTitle("Category");
  }, [setPageTitle]);
  return (
    <Section>
      <Flex
        className="bg-white"
        gap={32}
        vertical
      >
        <CategoryTableFilter />
        <CategoryTable />
      </Flex>
    </Section>
  );
};

export default PageCategory;
