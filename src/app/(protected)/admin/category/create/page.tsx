"use client";

import { useEffect, useRef, useState } from "react";
import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import CategoryForm from "@/features/category/components/form/CategoryForm";
import { TFormRef } from "@/data/type";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showToast } from "@/lib/error";
import { TCategoryForm } from "@/features/category/components/form/CategoryForm";
import { CATEGORY, TSaveCategoryPayload } from "@/features/category/data/type";
import CategoryServices from "@/features/category/services";
import UploadServices from "@/services/upload.service";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import ButtonCancel from "@/components/form/ButtonCancel";
import ButtonSave from "@/components/form/ButtonSave";

export default function PageCreateCategory() {
  const ref = useRef<TFormRef>(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { setPageTitle } = useSetHeaderContent();

  useEffect(() => {
    setPageTitle("Category");
  }, [setPageTitle]);

  const uploadFile = async (file: TFileType, fileName: string, categoryId: number): Promise<string> => {
    const response = await UploadServices.uploadFile({
      file,
      categoryId: categoryId.toString(),
      type: "thumb",
      name: fileName,
    });
    return response.path;
  };

  const onSubmit = async (values: TCategoryForm) => {
    setIsUploading(true);
    try {
      // Step 1: Create category with empty thumbUrl so BE creates the DB record and folder path
      const createPayload: TSaveCategoryPayload = { name: values.name, thumbUrl: "" };
      const created = await CategoryServices.addCategory(createPayload);
      const categoryId = (created as { id: number }).id;

      // Step 2: Upload thumbnail with real categoryId + name
      let thumbUrl = "";
      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        thumbUrl = await uploadFile(thumbFile, values.name || "category", categoryId);
      }

      // Step 3: Update category with thumbnail URL
      if (thumbUrl) {
        await CategoryServices.updateCategory(categoryId, {
          name: values.name,
          thumbUrl,
        });
      }

      // Invalidate cache and redirect directly — do NOT rely on useMutation onSuccess
      queryClient.invalidateQueries({ queryKey: [CATEGORY.LIST] });
      showSuccessToast("save", CATEGORY.LIST, "Category saved");
      router.push("/admin/category");
    } catch (error) {
      console.error("Form submission error:", error);
      showToast("server", "Failed to save category. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Spin spinning={isUploading}>
      <Section>
        <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>Create Category</Title>
          <Flex gap={12}>
            <ButtonCancel href="/admin/category" />
            <ButtonSave onClick={() => ref.current?.submit()} />
          </Flex>
        </Flex>

        <CategoryForm
          ref={ref}
          onSubmit={onSubmit}
        />
      </Section>
    </Spin>
  );
}
