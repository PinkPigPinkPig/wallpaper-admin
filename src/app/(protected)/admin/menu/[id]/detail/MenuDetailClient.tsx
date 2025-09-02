"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import useGetMenuDetail from "@/features/menu/hooks/useGetMenuDetail";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import Image from "next/image";

interface MenuDetailClientProps {
  menuId: number;
}

export default function MenuDetailClient({ menuId }: MenuDetailClientProps) {
  const { data: menu, isLoading } = useGetMenuDetail(menuId);

  return (
    <Spin spinning={isLoading}>
      <Section>
        <Flex
          align="center"
          justify="space-between"
        >
          <Title level={5} className="m-0">
            {menu?.wallpaperName ?? "Detail Menu"} 
          </Title>
          <ButtonCancel href={"/admin/menu"} />
        </Flex>

        <div className="mt-6">
          <div className="bg-white p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallpaper Name
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.wallpaperName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.categoryName || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.filter || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.page || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Index in Page
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.index_in_page || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Order
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.queryOrder || "N/A"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail
                </label>
                {menu?.thumbUrl ? (
                  <div className="p-3 bg-gray-50 rounded border">
                    <Image 
                      src={menu.thumbUrl} 
                      alt={menu.wallpaperName}
                      width={128}
                      height={128}
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded border text-gray-500">
                    No thumbnail available
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Updated
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {menu?.updated || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </Spin>
  );
}
