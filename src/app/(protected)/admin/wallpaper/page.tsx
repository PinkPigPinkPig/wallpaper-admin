"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import WallpaperTable from "@/features/wallpaper/components/WallpaperTable";
import WallpaperTableFilter from "@/features/wallpaper/components/WallpaperTableFilter";
import { Flex } from "antd";
import React, { useEffect } from "react";

const PageAdmin = () => {
  const { setPageTitle } = useSetHeaderContent();
  useEffect(() => {
    setPageTitle("Wallpaper");
  }, [setPageTitle]);
  return (
    <div>
      <Section>
        <Flex
          className="bg-white"
          gap={32}
          vertical
        >
          <WallpaperTableFilter />
          <WallpaperTable />
        </Flex>
      </Section>
    </div>
  );
};

export default PageAdmin;
