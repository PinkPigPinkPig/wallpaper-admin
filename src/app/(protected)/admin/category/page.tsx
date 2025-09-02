"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import CategoryTable from "@/features/category/components/CategoryTable";
import CategoryTableFilter from "@/features/category/components/CategoryTableFilter";
import { Button, Flex } from "antd";
import React, { useEffect } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const PageCategory = () => {
  const { setPageTitle } = useSetHeaderContent();
  const router = useRouter();

  useEffect(() => {
    setPageTitle("Category");
  }, [setPageTitle]);

  const handleClickCreateButton = () => {
    router.push("/admin/category/create");
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
            <CategoryTableFilter />
            <Button
              type="primary"
              onClick={handleClickCreateButton}
            >
              <Flex gap={8}>
                <PlusOutlined />
                <span>
                  Create Category
                </span>
              </Flex>
            </Button>
          </div>
          <CategoryTable />
        </Flex>
      </Section>
    </div>
  );
};

export default PageCategory;
