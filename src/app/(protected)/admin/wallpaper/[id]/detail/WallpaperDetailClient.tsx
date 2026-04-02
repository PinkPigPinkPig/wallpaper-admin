"use client";

import ButtonCancel from "@/components/form/ButtonCancel";
import ButtonSave from "@/components/form/ButtonSave";
import Section from "@/components/ui/Section";
import { TFormRef } from "@/data/type";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import { TForm } from "@/features/wallpaper/components/form/WallpaperForm";
import useGetWallpaperDetail from "@/features/wallpaper/hooks/useGetWallpaperDetail";
import WallpaperServices from "@/features/wallpaper/services";
import UploadServices from "@/services/upload.service";
import { TFileType } from "@/hooks/useUpload";
import { TSaveWallpaperPayload } from "@/features/wallpaper/data/type";
import { showSuccessToast, showToast } from "@/lib/error";
import { Button, Flex, Spin } from "antd";
import { useRouter } from "next/navigation";
import Title from "antd/es/typography/Title";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WALLPAPER } from "@/features/wallpaper/data/type";
import { IResponseError } from "@/lib/service/utility";

interface WallpaperDetailClientProps {
  wallpaperId: number;
}

export default function WallpaperDetailClient({ wallpaperId }: WallpaperDetailClientProps) {
  const { data: wallpaper, isLoading } = useGetWallpaperDetail(wallpaperId);
  const ref = useRef<TFormRef>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: TFileType,
    type: string,
    categoryId: number,
    fileName: string
  ): Promise<string> => {
    // uploadFile expects File; TFileType may be File or have originFileObj
    const fileToUpload = (file as File) || (file as { originFileObj?: File }).originFileObj;
    const response = await UploadServices.uploadFile({
      file: fileToUpload as File,
      categoryId: categoryId.toString(),
      type,
      name: fileName,
    });
    return response.path;
  };

  const onSuccess = () => {
    showSuccessToast("save", WALLPAPER.LIST, "Wallpaper updated");
    queryClient.invalidateQueries({ queryKey: [WALLPAPER.LIST] });
    queryClient.invalidateQueries({ queryKey: [WALLPAPER.DETAIL, wallpaperId] });
    setIsEditing(false);
    router.push("/admin/wallpaper");
  };

  const onError = (error: IResponseError<unknown>) => {
    showToast("server", (error as { message?: string }).message || "Failed to update wallpaper");
  };

  const onSubmit = async (values: TForm) => {
    if (!wallpaper) return;
    setIsUploading(true);

    try {
      let resourceUrl: string | undefined = wallpaper.resourceUrl;
      let thumbUrl: string | undefined = wallpaper.thumbUrl;

      const resourceFile = values.resourceFiles?.[0];
      const isNewResourceFile = (resourceFile as { originFileObj?: unknown }).originFileObj;
      if (resourceFile && isNewResourceFile) {
        resourceUrl = await uploadFile(resourceFile, "content", Number(values.categoryId), values.name);
      }

      const thumbFile = values.thumbFiles?.[0];
      const isNewThumbFile = (thumbFile as { originFileObj?: unknown }).originFileObj;
      if (thumbFile && isNewThumbFile) {
        thumbUrl = await uploadFile(thumbFile, "thumb", Number(values.categoryId), values.name);
      }

      const payload: TSaveWallpaperPayload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        tags: values.tags ?? "",
        resolution: values.resolution ?? "",
        size: values.size ?? "",
        mime: values.mime,
        resourceUrl: resourceUrl ?? "",
        thumbUrl: thumbUrl ?? "",
      };

      await WallpaperServices.updateWallpaper(wallpaperId, payload);
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
      onError(error as IResponseError<unknown>);
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = wallpaper
    ? {
        categoryId: wallpaper.category_id,
        name: wallpaper.name,
        resolution: wallpaper.resolution,
        size: wallpaper.size,
        mime: wallpaper.mime,
        tags: wallpaper.tags,
        resourceFiles: wallpaper.resourceUrl
          ? ([{
              uid: "resource-1",
              name: wallpaper.name,
              url: wallpaper.resourceUrl,
              thumbUrl: wallpaper.thumbUrl,
            }] as unknown as TFileType[])
          : [],
        thumbFiles: wallpaper.thumbUrl
          ? ([{
              uid: "thumb-1",
              name: `${wallpaper.name}_thumb`,
              url: wallpaper.thumbUrl,
              thumbUrl: wallpaper.thumbUrl,
            }] as unknown as TFileType[])
          : [],
      }
    : undefined;

  return (
    <Spin spinning={isLoading || isUploading}>
      <Section>
        <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            {wallpaper?.name ?? "Detail Wallpaper"}
          </Title>
          <Flex gap={12}>
            {isEditing ? (
              <>
                <ButtonCancel onClick={() => setIsEditing(false)} />
                <ButtonSave onClick={() => ref.current?.submit()} />
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} style={{ fontWeight: 600 }}>
                  Edit
                </Button>
                <ButtonCancel href="/admin/wallpaper" />
              </>
            )}
          </Flex>
        </Flex>

        <WallpaperForm
          ref={ref}
          readOnly={!isEditing}
          initialValues={initialValues}
          onSubmit={isEditing ? onSubmit : undefined}
        />
      </Section>
    </Spin>
  );
}
