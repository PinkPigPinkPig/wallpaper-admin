"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import CategoryForm from "@/features/category/components/form/CategoryForm";
import useGetCategoryDetail from "@/features/category/hooks/useGetCategoryDetail";
import CategoryServices from "@/features/category/services";
import UploadServices from "@/services/upload.service";
import { TCategoryForm } from "@/features/category/components/form/CategoryForm";
import { TSaveCategoryPayload } from "@/features/category/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin, Button } from "antd";
import Title from "antd/es/typography/Title";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY } from "@/features/category/data/type";
import { IResponseError } from "@/lib/service/utility";
import { useRouter } from "next/navigation";

interface CategoryDetailClientProps {
  categoryId: number;
}

export default function CategoryDetailClient({ categoryId }: CategoryDetailClientProps) {
  const { data: category, isLoading } = useGetCategoryDetail(categoryId);
  const ref = useRef<TFormRef>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onSuccess = () => {
    showSuccessToast("save", CATEGORY.LIST, "Category updated");
    queryClient.invalidateQueries({ queryKey: [CATEGORY.LIST] });
    queryClient.invalidateQueries({ queryKey: ["category-detail", categoryId] });
    router.push("/admin/category");
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update category");
  };

  const onSubmit = async (values: TCategoryForm) => {
    setIsUploading(true);
    try {
      let thumbUrl: string | undefined;

      const thumbFile = values.thumbFiles?.[0];
      const isNewThumbFile = (thumbFile as { originFileObj?: unknown }).originFileObj;
      if (thumbFile && isNewThumbFile) {
        const response = await UploadServices.uploadFile({
          file: thumbFile,
          categoryId: categoryId.toString(),
          type: "thumb",
          name: values.name || "category",
        });
        thumbUrl = response.path;
      } else {
        thumbUrl = category?.thumbUrl;
      }

      const payload: TSaveCategoryPayload = {
        name: values.name,
        thumbUrl: thumbUrl ?? "",
      };

      await CategoryServices.updateCategory(categoryId, payload);
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      onError(error as IResponseError<unknown>);
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = category
    ? {
        name: category.name,
        thumbFiles: category.thumbUrl
          ? ([{
              uid: "thumb-1",
              name: `${category.name}_thumb`,
              url: category.thumbUrl,
              thumbUrl: category.thumbUrl,
            }] as unknown as TFileType[])
          : [],
      }
    : undefined;

  return (
    <Spin spinning={isLoading || isUploading}>
      <Section>
        <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            {category?.name ?? "Detail Category"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={() => setIsEditing(false)} />
                <Button
                  type="primary"
                  onClick={() => ref.current?.submit()}
                  style={{ fontWeight: 600 }}
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} style={{ fontWeight: 600 }}>
                  Edit
                </Button>
                <ButtonCancel href="/admin/category" />
              </>
            )}
          </Flex>
        </Flex>

        <CategoryForm
          ref={ref}
          readOnly={!isEditing}
          initialValues={initialValues}
          onSubmit={isEditing ? onSubmit : undefined}
        />
      </Section>
    </Spin>
  );
}
