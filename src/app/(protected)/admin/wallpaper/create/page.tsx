"use client";

import { useRef, useState } from "react";
import { Alert, Button, Card, Divider, Flex, message, Spin } from "antd";
import Title from "antd/es/typography/Title";
import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import { TFormRef } from "@/data/type";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast } from "@/lib/error";
import { TForm } from "@/features/wallpaper/components/form/WallpaperForm";
import { WALLPAPER, TSaveWallpaperPayload } from "@/features/wallpaper/data/type";
import { IResponseError } from "@/lib/service/utility";
import WallpaperServices from "@/features/wallpaper/services";
import UploadServices from "@/services/upload.service";
import { TFileType } from "@/hooks/useUpload";
import ButtonCancel from "@/components/form/ButtonCancel";
import ButtonSave from "@/components/form/ButtonSave";

export default function PageCreateWallpaper() {
  const ref = useRef<TFormRef>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { setPageTitle } = useSetHeaderContent();

  const onSuccess = () => {
    showSuccessToast("save", WALLPAPER.LIST, "Wallpaper saved");
    queryClient.invalidateQueries({ queryKey: [WALLPAPER.LIST] });
    router.push("/admin/wallpaper");
  };

  const onError = (error: IResponseError<unknown>) => {
    messageApi.error((error as { message?: string }).message || "Failed to save wallpaper");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: TSaveWallpaperPayload) =>
      WallpaperServices.addWallpaper(payload),
    onSuccess,
    onError,
  });

  const onSubmit = async (values: TForm) => {
    setIsUploading(true);
    try {
      let resourceUrl: string | undefined;
      let thumbUrl: string | undefined;

      const resourceFile = values.resourceFiles?.[0];
      if (resourceFile) {
        const response = await UploadServices.uploadFile({
          file: resourceFile,
          categoryId: values.categoryId.toString(),
          type: "content",
          name: values.name,
        });
        resourceUrl = response.path;
      }

      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        const response = await UploadServices.uploadFile({
          file: thumbFile,
          categoryId: values.categoryId.toString(),
          type: "thumb",
          name: values.name,
        });
        thumbUrl = response.path;
      }

      const payload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        tags: values.tags ?? "",
        resolution: values.resolution ?? "",
        size: values.size ?? "",
        mime: values.mime,
        resourceUrl: resourceUrl ?? "",
        thumbUrl: thumbUrl ?? "",
      };
      mutate(payload);
    } catch (error) {
      console.error("Form submission error:", error);
      messageApi.error("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Section>
      {contextHolder}

      {/* Header */}
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Create Wallpaper</Title>
        <Flex gap={12}>
          <ButtonCancel href="/admin/wallpaper" />
          <ButtonSave onClick={() => ref.current?.submit()} />
        </Flex>
      </Flex>

      {/* Upload loading indicator */}
      {isUploading && (
        <Alert
          message="Uploading files..."
          description="Please wait while your files are being uploaded."
          type="info"
          showIcon
          icon={<Spin size="small" />}
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* Basic Info Card */}
      <Card
        title="Basic Information"
        size="small"
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ header: { fontWeight: 600 } }}
      >
        <WallpaperForm
          ref={ref}
          onSubmit={onSubmit}
          disabled={isPending}
        />
      </Card>
    </Section>
  );
}
