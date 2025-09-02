"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import CategoryForm from "@/features/category/components/form/CategoryForm";
import useGetCategoryDetail from "@/features/category/hooks/useGetCategoryDetail";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import { useRef } from "react";

interface CategoryDetailClientProps {
  categoryId: number;
}

export default function CategoryDetailClient({ categoryId }: CategoryDetailClientProps) {
  const { data: category, isLoading } = useGetCategoryDetail(categoryId);
  const ref = useRef<TFormRef>(null);

  return (
    <Spin spinning={isLoading}>
      <Section>
        <Flex
          align="center"
          justify="space-between"
        >
          <Title level={5} className="m-0">
            {category?.name ?? "Detail Category"} 
          </Title>
          <ButtonCancel href={"/admin/category"} />
        </Flex>

        <CategoryForm 
          ref={ref} 
          readOnly={true}
          initialValues={category ? {
            name: category.name,
            thumbFiles: [{
              uid: 'thumb-1',
              name: `${category.name}_thumb`,
              url: category.thumbUrl,
              thumbUrl: category.thumbUrl,
            } as unknown as TFileType],
          } : undefined} 
        />
      </Section>
    </Spin>
  );
}
