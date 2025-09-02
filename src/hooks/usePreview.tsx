"use client";

import Show from '@/components/ui/Show';
import { GetProp, Image, UploadProps } from 'antd';
import { useState } from 'react';
import { TFileList } from './useUpload';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const usePreview = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async (file: TFileList) => {
    if (file.type === 'application/pdf') {
      const localFileUrl = URL.createObjectURL(file.originFileObj as Blob);
      window.open(localFileUrl, '_blank');
      return;
    }

    // Check if it's a video file
    const isVideo = file.type?.startsWith('video/') || 
                   file.extension === 'MP4' || 
                   file.extension === 'AVI' || 
                   file.extension === 'MOV' || 
                   file.extension === 'WMV' || 
                   file.extension === 'FLV' || 
                   file.extension === 'WEBM' ||
                   file.path?.toLowerCase()?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/) ||
                   file.name?.toLowerCase()?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/);

    if (isVideo) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj as FileType);
      }
      setPreviewImage(file.url || (file.preview as string));
      setPreviewOpen(true);
      return;
    }

    const isValidPreviewImg = file.type ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type) : true;
    if (!file.extension && !isValidPreviewImg) return;

    const isPdf = file.extension === 'PDF' || file.path?.toLowerCase()?.includes('.pdf') || file.name?.includes('.pdf');
    if (isPdf) {
      window.open(file.url, '_blank');
      return;
    }

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const ImagePreview = (
    <div>
      <Show when={previewOpen}>
        <Image
          alt="Preview"
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      </Show>
    </div>
  );

  return { handlePreview, ImagePreview };
};

export default usePreview;
