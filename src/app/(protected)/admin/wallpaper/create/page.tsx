"use client";

import Section from "@/components/ui/Section";
import { useSetHeaderContent } from "@/context/header/HeaderProvider";
import WallpaperForm from "@/features/wallpaper/components/form/WallpaperForm";
import { TFormRef } from "@/data/type";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Errors } from '@/data/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postMessageHandler } from "@/components/ui/ToastMessage";
import { TForm } from "@/features/wallpaper/components/form/WallpaperForm";
import { WALLPAPER, TSaveWallpaperPayload } from "@/features/wallpaper/data/type";
import { IResponseError } from '@/lib/service/utility';
import WallpaperServices from "@/features/wallpaper/services";
import UploadServices from "@/services/upload.service";
import { TFileType } from "@/hooks/useUpload";
import { Flex, Spin } from "antd";
import Title from "antd/es/typography/Title";
import ButtonCancel from "@/components/form/ButtonCancel";
import ButtonSave from "@/components/form/ButtonSave";

export default function PageCreateWallpaper() {
  const ref = useRef<TFormRef>(null);
  const router = useRouter();
  const [errorCode, setErrorCode] = useState<
    Errors | undefined
  >();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { setPageTitle } = useSetHeaderContent();

  useEffect(() => {
    setPageTitle("Wallpaper");
  }, [setPageTitle]);

  const uploadFile = async (file: TFileType, type: string, categoryId: number, fileName: string): Promise<string> => {
    try {
      const response = await UploadServices.uploadFile({
        file: file,
        categoryId: categoryId.toString(),
        type: type,
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
    postMessageHandler({
      id: "successfully",
      type: "success",
      text: "Successfully saved",
    });
    queryClient.invalidateQueries({
      queryKey: [
        WALLPAPER.LIST,
      ],
    });
    router.push("/admin/wallpaper");
  };

  const onError = (
    error: IResponseError<unknown>
  ) => {
    setErrorCode(error.errorCode);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (
      payload: TSaveWallpaperPayload
    ) =>
      WallpaperServices.addWallpaper(
        payload
      ),
    onSuccess,
    onError,
  });

  const onSubmit = async (
    values: TForm
  ) => {
    setIsUploading(true);

    try {
      let resourceUrl: string | undefined;
      let thumbUrl: string | undefined;

      // Upload resource file if exists
      const resourceFile = values.resourceFiles?.[0];
      if (resourceFile) {
        resourceUrl = await uploadFile(resourceFile, "content", Number(values.categoryId), values.name);
      }

      // Upload thumbnail file if exists
      const thumbFile = values.thumbFiles?.[0];
      if (thumbFile) {
        thumbUrl = await uploadFile(thumbFile, "thumb", Number(values.categoryId), values.name);
      }

      // Transform TForm to match the expected payload structure
      const payload = {
        name: values.name,
        categoryId: Number(values.categoryId),
        tags: values.tags,
        resolution: values.resolution,
        size: values.size,
        mime: values.mime,
        resourceUrl: resourceUrl || "",
        thumbUrl: thumbUrl || "",
      };
      mutate(payload);
    } catch (error) {
      console.error('Form submission error:', error);
      postMessageHandler({
        id: "upload-error",
        type: "error",
        text: "Failed to upload files. Please try again.",
      });
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
            Create Wallpaper
          </Title>
          <Flex gap={12}>
            <ButtonCancel
              href={
                "/admin/wallpaper"
              }
            />
            <ButtonSave
              onClick={() =>
                ref.current?.submit()
              }
            />
          </Flex>
        </Flex>

        <WallpaperForm
          ref={ref}
          errorCode={errorCode}
          onSubmit={onSubmit}
        />
      </Section>
    </Spin>
  );
};
