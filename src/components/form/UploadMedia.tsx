"use client";

import useUpload, { ErrorUpload, TFileList, TFileType } from '@/hooks/useUpload';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Flex, Upload, UploadProps } from 'antd';
import Text from 'antd/es/typography/Text';
import { DndContext, PointerSensor, useSensor, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import DraggableUploadListItem from '@/components/form/DraggableUploadListItem';
import { differenceWith, isEqualWith } from 'lodash';
import { usePreview } from '@/hooks';
import { convertToArray } from '@/utils/file';

type TProps = Omit<UploadProps, 'onChange'> & {
  size?: number;
  fileType?: string;
  onChange?: (fileList: TFileList[]) => void;
  onFilesChange?: (files: TFileType[]) => void; // New prop to pass actual files for later upload
  initialFiles?: TFileType[];
};

const UploadMedia = ({
  disabled,
  className,
  maxCount = 9999,
  size = 64,
  accept = '.jpg, .jpeg, .png, .mp4, .avi, .mov, .wmv, .flv, .webm',
  multiple,
  fileType,
  onChange,
  onFilesChange,
  initialFiles,
  ...rest
}: TProps) => {
  const [mediaWarning, setDocumentsWarning] = useState('');
  const [localFiles, setLocalFiles] = useState<TFileType[]>([]); // Store actual files for later upload

  const { handlePreview, ImagePreview } = usePreview();

  const handleOnChange = (fileList: TFileList[]) => {
    const tempFileList = fileType ? fileList.map((item) => ({ ...item, fileType })) : fileList;
    if (onChange) onChange(tempFileList);
  };

  const onSuccess = (fileList: TFileList[]) => {
    handleOnChange(fileList);
  };

  const onError = (e: Error) => {
    if (e.name === ErrorUpload.LimitFiles) {
      setDocumentsWarning(e.message);
    }
  };

  const mediaHandler = useUpload({
    onSuccess,
    onError,
    accepts: convertToArray(accept),
    size: size,
    maxCount,
    canReplace: false,
  });

  // Populate with existing files on mount (for update mode with pre-filled values)
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      const previewList: TFileList[] = initialFiles.map((file: TFileType & { uid?: string; url?: string; thumbUrl?: string }, idx: number) => ({
        ...file,
        uid: file.uid || `initial-${idx}`,
        url: file.url || file.thumbUrl || '',
        status: 'done' as const,
      }));
      mediaHandler.setFileList(previewList);
      setLocalFiles(initialFiles);
      if (onFilesChange) onFilesChange(initialFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  useEffect(() => {
    const arrDiff = differenceWith(rest.fileList, mediaHandler.fileList, (oldArr, newArr) =>
      isEqualWith(oldArr, newArr, (oldV, newV) => oldV.id === newV.id),
    );

    if (arrDiff?.length) mediaHandler.setFileList(rest.fileList || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest.fileList]);

  const isMaxCount = mediaHandler.fileList.length >= maxCount;
  const hasFiles = mediaHandler.fileList.length > 0;

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = mediaHandler.fileList.findIndex((i) => i.uid === active.id);
      const overIndex = mediaHandler.fileList.findIndex((i) => i.uid === over?.id);

      const movedArray = arrayMove(mediaHandler.fileList, activeIndex, overIndex);
      mediaHandler.setFileList(movedArray);
      handleOnChange(movedArray);
      
      // Also reorder the local files array
      const movedLocalFiles = arrayMove(localFiles, activeIndex, overIndex);
      setLocalFiles(movedLocalFiles);
      if (onFilesChange) onFilesChange(movedLocalFiles);
    }
  };

  // Custom beforeUpload to validate files without uploading
  const beforeUpload = (file: TFileType, fileList: TFileType[]) => {
    if (!mediaHandler.beforeUpload(file, fileList)) {
      return Upload.LIST_IGNORE;
    }
    
    // Add to local files array
    const newLocalFiles = [...localFiles, file];
    setLocalFiles(newLocalFiles);
    if (onFilesChange) onFilesChange(newLocalFiles);
    
    return false; // Prevent default upload behavior
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    // Create file list with local URLs for preview
    const previewFileList = info.fileList.map((file) => {
      if (file.originFileObj) {
        // Create local URL for new files
        const localUrl = URL.createObjectURL(file.originFileObj);
        return {
          ...file,
          url: localUrl,
          status: 'done' as const,
        };
      }
      return file;
    });

    mediaHandler.setFileList(previewFileList);
    handleOnChange(previewFileList);

    if (info.fileList.length < maxCount) {
      setDocumentsWarning('');
    }
  };

  const handleRemove = (file: TFileList) => {
    // Remove from local files array
    const newLocalFiles = localFiles.filter(f => f.uid !== file.uid);
    setLocalFiles(newLocalFiles);
    if (onFilesChange) onFilesChange(newLocalFiles);

    // Remove from file list
    const newFileList = mediaHandler.fileList.filter(f => f.uid !== file.uid);
    mediaHandler.setFileList(newFileList);
    handleOnChange(newFileList);

    // Cleanup local URL
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url);
    }
  };

  // Cleanup local URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaHandler.fileList.forEach((file) => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, []);

  return (
    <>
      <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
        <SortableContext items={mediaHandler.fileList.map((i) => i.uid)} strategy={horizontalListSortingStrategy}>
          <Upload
            {...rest}
            multiple={multiple}
            listType="picture-card"
            accept={accept}
            className={`upload-picture-card [&_.ant-upload-list-picture-card-container]:!w-[250px] [&_.ant-upload-list-picture-card-container]:!h-[250px] [&_.ant-upload-list-picture-card_.ant-upload-list-item]:!w-[250px] [&_.ant-upload-list-picture-card_.ant-upload-list-item]:!h-[250px] [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail]:!w-[250px] [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail]:!h-[250px] [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail]:!flex [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail]:!items-center [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail]:!justify-center [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail_img]:!max-w-full [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail_img]:!max-h-full [&_.ant-upload-list-picture-card_.ant-upload-list-item-thumbnail_img]:!object-cover [ant-upload-list-item-thumbnail]:!flex ${className}`}
            maxCount={maxCount}
            fileList={mediaHandler.fileList}
            beforeUpload={beforeUpload}
            disabled={disabled}
            onPreview={handlePreview}
            openFileDialogOnClick={!isMaxCount && !hasFiles}
            itemRender={(originNode, file) => <DraggableUploadListItem originNode={originNode} file={file} />}
            onChange={handleChange}
            onRemove={handleRemove}
            style={{ width: '250px', height: '250px' }}>
            {!hasFiles && (
              <Button className="w-full h-full border-none" disabled={isMaxCount || disabled}>
                <Flex align="center" gap={4}>
                  <UploadOutlined style={{ fontSize: 24, color: '#00000073' }} />
                  <Text>Upload</Text>
                </Flex>
              </Button>
            )}
          </Upload>
        </SortableContext>
      </DndContext>

      {mediaWarning && <Text type="warning">{mediaWarning}</Text>}

      {ImagePreview}
    </>
  );
};

export default UploadMedia;
