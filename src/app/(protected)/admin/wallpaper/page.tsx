"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import WallpaperTable from "@/features/wallpaper/components/WallpaperTable";
import WallpaperTableFilter from "@/features/wallpaper/components/WallpaperTableFilter";
import { Button, Flex } from "antd";
import React, { useEffect } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const PageAdmin = () => {
  const { setPageTitle } = useSetHeaderContent();
  const router = useRouter();

  useEffect(() => {
    setPageTitle("Wallpaper");
  }, [setPageTitle]);

  const handleClickCreateButton = () => {
    router.push("/admin/wallpaper/create");
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
            <WallpaperTableFilter />
            <Button
              type="primary"
              onClick={handleClickCreateButton}
            >
              <Flex gap={8}>
                <PlusOutlined />
                <span>
                  Create Wallpaper
                </span>
              </Flex>
            </Button>
          </div>
          <WallpaperTable />
        </Flex>
      </Section>
    </div>
  );
};

export default PageAdmin;
