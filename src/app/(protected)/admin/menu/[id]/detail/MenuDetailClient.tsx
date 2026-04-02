"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import useGetMenuDetail from "@/features/menu/hooks/useGetMenuDetail";
import MenuServices from "@/features/menu/services";
import MenuForm from "@/features/menu/components/form/MenuForm";
import { TMenuForm } from "@/features/menu/components/form/MenuForm";
import { FilterType, QueryOrder } from "@/features/menu/data/type";
import { TSaveMenuPayload } from "@/features/menu/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { Flex, Spin, Button } from "antd";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MENU } from "@/features/menu/data/type";
import { IResponseError } from "@/lib/service/utility";

interface MenuDetailClientProps {
  menuId: number;
}

export default function MenuDetailClient({ menuId }: MenuDetailClientProps) {
  const { data: menu, isLoading } = useGetMenuDetail(menuId);
  const formRef = useRef<{ submit: () => void }>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  const onSuccess = () => {
    showSuccessToast("save", MENU.LIST, "Menu updated");
    queryClient.invalidateQueries({ queryKey: [MENU.LIST] });
    queryClient.invalidateQueries({ queryKey: ["menu-detail", menuId] });
    setIsEditing(false);
    router.push("/admin/menu");
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update menu");
  };

  const handleSubmit = async (values: TMenuForm) => {
    if (!menu) return;
    const payload: TSaveMenuPayload = {
      filter: values.filter,
      queryOrder: values.queryOrder,
      page: values.page,
      index_in_page: values.index_in_page,
      wallpaper_id: menu.wallpaper_id,
      category_id: menu.category_id,
    };
    try {
      await MenuServices.updateMenu(menuId, payload);
      onSuccess();
    } catch (error) {
      onError(error as IResponseError<unknown>);
    }
  };

  return (
    <Spin spinning={isLoading}>
      <Section>
        <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            {menu?.wallpaperName ?? "Detail Menu"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={handleCancel} />
                <Button
                  type="primary"
                  onClick={() => formRef.current?.submit()}
                  style={{ fontWeight: 600 }}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit} style={{ fontWeight: 600 }}>
                  Edit
                </Button>
                <ButtonCancel href="/admin/menu" />
              </>
            )}
          </Flex>
        </Flex>

        {isEditing ? (
          <MenuForm
            ref={formRef}
            initialValues={menu ? {
              filter: menu.filter as FilterType,
              queryOrder: menu.queryOrder as QueryOrder,
              page: menu.page,
              index_in_page: menu.index_in_page,
            } : undefined}
            onSubmit={handleSubmit}
          />
        ) : (
          menu && (
            <div className="mt-6">
              <div className="bg-white p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallpaper Name</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.wallpaperName || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.categoryName || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.filter || "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.page ?? "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Index in Page</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.index_in_page ?? "N/A"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Query Order</label>
                    <div className="p-3 bg-gray-50 rounded border">{menu.queryOrder || "N/A"}</div>
                  </div>
                  {menu.thumbUrl && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                      <div className="p-3 bg-gray-50 rounded border">
                        <Image src={menu.thumbUrl} alt={menu.wallpaperName} width={128} height={128} className="object-cover rounded" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
      </Section>
    </Spin>
  );
}
