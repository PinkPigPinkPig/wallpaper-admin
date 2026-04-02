"use client";

import { useRef, useState } from "react";
import { Alert, Card, Flex, message } from "antd";
import Title from "antd/es/typography/Title";
import Section from "@/components/ui/Section";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import { TFormRef } from "@/data/type";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast } from "@/lib/error";
import { TForm } from "@/features/wallpaper/components/form/WallpaperForm";
import { TSaveWallpaperPayload } from "@/features/wallpaper/data/type";
import { IResponseError } from "@/lib/service/utility";
import WallpaperServices from "@/features/wallpaper/services";
import UploadServices from "@/services/upload.service";
import ButtonCancel from "@/components/form/ButtonCancel";

export default function PageCreateWallpaper() {
  const ref = useRef<TFormRef>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onSuccess = () => {
    showSuccessToast("save", "wallpaper-list", "Wallpaper saved");
    queryClient.invalidateQueries({ queryKey: ["wallpaper-list"] });
    router.push("/admin/wallpaper");
  };

  const onError = (error: IResponseError<unknown>) => {
    messageApi.error((error as { message?: string }).message || "Failed to save wallpaper");
  };

  const { mutate } = useMutation({
    mutationFn: (payload: TSaveWallpaperPayload) =>
      WallpaperServices.addWallpaper(payload),
    onSuccess,
    onError,
  });

  const uploadFile = async (
    file: File,
    categoryId: string,
    type: string,
    name: string
  ): Promise<string> => {
    const response = await UploadServices.uploadFile({
      file,
      categoryId,
      type,
      name,
    });
    return response.path;
  };

  const onSubmit = async (values: TForm) => {
    setIsUploading(true);
    try {
      let resourceUrl = "";
      let thumbUrl = "";

      const resourceFile = values.resourceFiles?.[0];
      if (resourceFile && (resourceFile as { originFileObj?: File }).originFileObj) {
        resourceUrl = await uploadFile(
          ((resourceFile as unknown) as { originFileObj: File }).originFileObj,
          values.categoryId.toString(),
          "content",
          values.name
        );
      }

      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile && (thumbFile as { originFileObj?: File }).originFileObj) {
        thumbUrl = await uploadFile(
          ((thumbFile as unknown) as { originFileObj: File }).originFileObj,
          values.categoryId.toString(),
          "thumb",
          values.name
        );
      }

      const payload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        tags: values.tags ?? "",
        resolution: values.resolution ?? "",
        size: values.size ?? "",
        mime: values.mime,
        resourceUrl,
        thumbUrl,
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

      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>Create Wallpaper</Title>
        <Flex gap={12}>
          <ButtonCancel href="/admin/wallpaper" />
          <button
            onClick={() => ref.current?.submit()}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              border: "1px solid #d9d9d9",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </Flex>
      </Flex>

      {isUploading && (
        <Alert
          message="Uploading files..."
          description="Please wait while your files are being uploaded."
          type="info"
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Card
        title="Basic Information"
        size="small"
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ header: { fontWeight: 600 }}}
      >
        <WallpaperForm
          ref={ref}
          onSubmit={onSubmit}
        />
      </Card>
    </Section>
  );
}
