"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import useGetWallpaperDetail from "@/features/wallpaper/hooks/useGetWallpaperDetail";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { useRef } from "react";

interface WallpaperDetailClientProps {
  wallpaperId: number;
}

export default function WallpaperDetailClient({ wallpaperId }: WallpaperDetailClientProps) {
  const { data: wallpaper, isLoading } = useGetWallpaperDetail(wallpaperId);
  const ref = useRef<TFormRef>(null);

  return (
    <Spin spinning={isLoading}>
      <Section>
        <Flex
          align="center"
          justify="space-between"
        >
          <Title level={5} className="m-0">
            {wallpaper?.name ?? "Detail Wallpaper"} 
          </Title>
          <ButtonCancel href={"/admin/wallpaper"} />
        </Flex>

        <WallpaperForm 
          ref={ref} 
          readOnly={true}
          initialValues={wallpaper ? {
            categoryId: wallpaper.category_id,
            name: wallpaper.name,
            resolution: wallpaper.resolution,
            size: wallpaper.size,
            mime: wallpaper.mime,
            tags: wallpaper.tags,
            resourceFiles: [{
              uid: 'resource-1',
              name: wallpaper.name,
              url: wallpaper.resourceUrl,
              thumbUrl: wallpaper.thumbUrl,
            } as unknown as TFileType],
            thumbFiles: [{
              uid: 'thumb-1',
              name: `${wallpaper.name}_thumb`,
              url: wallpaper.thumbUrl,
              thumbUrl: wallpaper.thumbUrl,
            } as unknown as TFileType],
          } : undefined} 
        />
      </Section>
    </Spin>
  );
}
