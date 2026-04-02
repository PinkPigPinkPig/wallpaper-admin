"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import CategoryForm from "@/features/category/components/form/CategoryForm";
import { TFormRef } from "@/data/type";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showToast } from '@/lib/error';
import { TCategoryForm } from "@/features/category/components/form/CategoryForm";
import { CATEGORY, TSaveCategoryPayload } from "@/features/category/data/type";
import { IResponseError } from '@/lib/service/utility';
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
    try {
      const response = await UploadServices.uploadFile({
        file: file,
        categoryId: categoryId.toString(),
        type: "thumb", // Use "thumb" type for category thumbnail
        name: fileName,
      });

      // Return the file path from the response
      return response.path;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Failed to upload ${fileName}`);
    }
  };

  const onSuccess = () => {
    showSuccessToast('save', CATEGORY.LIST, 'Category saved');
    queryClient.invalidateQueries({
      queryKey: [
        CATEGORY.LIST,
      ],
    });
    router.push("/admin/category");
  };

  const onError = (
    error: IResponseError<unknown>
  ) => {
    console.error('Error creating category:', error);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (
      payload: TSaveCategoryPayload
    ) =>
      CategoryServices.addCategory(
        payload
      ),
    onSuccess,
    onError,
  });

  const onSubmit = async (
    values: TCategoryForm
  ) => {
    setIsUploading(true);

    try {
      // Step 1: Create category with empty thumbUrl so BE creates the DB record and folder path
      // (BE resolves category name → folder: /uploads/{name}/thumb/)
      const createPayload = {
        name: values.name,
        thumbUrl: "",
      };
      const created = await CategoryServices.addCategory(createPayload);
      const categoryId = (created as { id: number }).id;

      // Step 2: Upload thumbnail with real categoryId + name
      // BE calls findById(categoryId) → gets name → file lands in /uploads/{name}/thumb/
      let thumbUrl = "";
      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        thumbUrl = await uploadFile(thumbFile, values.name || 'category', categoryId);
      }

      // Step 3: Update with thumbnail URL
      if (thumbUrl) {
        await CategoryServices.updateCategory(categoryId, {
          name: values.name,
          thumbUrl,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      showToast('server', 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Spin spinning={isPending || isUploading}>
      <Section>
        <Flex
          align="center"
          justify="space-between"
        >
          <Title level={5} className="m-0">
            Create Category
          </Title>
          <Flex gap={12}>
            <ButtonCancel
              href={
                "/admin/category"
              }
            />
            <ButtonSave
              onClick={() =>
                ref.current?.submit()
              }
            />
          </Flex>
        </Flex>

        <CategoryForm
          ref={ref}
          onSubmit={onSubmit}
        />
      </Section>
    </Spin>
  );
};
