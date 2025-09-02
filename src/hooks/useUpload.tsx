"use client";

import UploadServices from "@/services/upload.service";
import {
  UploadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Flex,
  Spin,
  type GetProp,
  type UploadFile,
  type UploadProps,
  Button,
  Upload,
} from "antd";
import Text from "antd/es/typography/Text";
import { clone, debounce } from "lodash";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useMemo, useRef, useState } from "react";

export type TFileType = Parameters<
  GetProp<UploadProps, "beforeUpload">
>[0];

export type TFileList = UploadFile & {
  path?: string;
  extension?: string;
  fileType?: string;
  id?: string;
};

type SuccessCallback = (
  data: TFileList[]
) => void;
type ErrorCallback = (error: Error) => void;
type Config = {
  onSuccess?: SuccessCallback;
  onError?: ErrorCallback;
  onChange?: (fileList: TFileList[]) => void;
  accepts?: string[];
  size?: number;
  maxCount?: number;
  readOnly?: boolean;
  canReplace?: boolean;
};

export const ErrorUpload = {
  Required: "Required",
  InvalidFile: "InvalidFile",
  ExceedSize: "ExceedSize",
  LimitFiles: "LimitFiles",
};

type State = {
  data?: TFileList[];
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string;
};

export const checkIsValidFiles = (
  file: TFileType,
  accepts: string[]
) => {
  return accepts
    ? accepts.includes(
        file.type.split("/")[1] ?? ""
      )
    : true;
};

export const checkIsValidFilesSize = (
  file: TFileType,
  size = 1
) => {
  return size
    ? file.size / 1024 / 1024 < size
    : true;
};

const useUpload = (config: Config) => {
  const fileList = useRef<TFileList[]>([]);
  const [state, setState] = useState<State>({
    data: [],
    isPending: false,
    isSuccess: false,
    isError: false,
    error: "",
  });

  const {
    onSuccess,
    onError,
    accepts = [],
    size,
    maxCount = 1,
    readOnly = false,
    onChange,
    canReplace = true,
  } = config;

  const debouncedOnSuccess = debounce(
    (data: TFileList[]) =>
      onSuccess && onSuccess(data),
    300
  );

  const setFileList = (files: TFileList[]) => {
    fileList.current = clone(files);
    setState((s) => ({
      ...s,
      data: fileList.current,
    }));
  };

  const checkIsEnoughFiles = (
    file: TFileType,
    bFileList: TFileType[],
    maxCount = 1
  ) => {
    const index = bFileList.findIndex(
      (item) => item.uid === file.uid
    );

    return (
      index + fileList.current.length >= maxCount
    );
  };

  const beforeUpload = (
    file: TFileType,
    bFileList: TFileType[]
  ) => {
    if (
      !canReplace &&
      fileList.current.length >= maxCount
    )
      return Upload.LIST_IGNORE;

    if (
      bFileList.length + fileList.current.length >
      maxCount
    ) {
      const e = new Error("File limit");
      e.name = ErrorUpload.LimitFiles;
      if (onError) onError(e);
    }

    if (
      (maxCount > 1 ||
        (maxCount === 1 && !canReplace)) &&
      checkIsEnoughFiles(
        file,
        bFileList,
        maxCount
      )
    ) {
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const upload = async (
    options: RcCustomRequestOptions
  ) => {
    const {
      onSuccess: onUploadSuccess,
      onError: onUploadError,
    } = options;
    const file = options.file as TFileType;

    setState((s) => ({ ...s, isPending: true }));

    try {
      if (!checkIsValidFiles(file, accepts)) {
        throw new Error("Invalid file extension");
      }
      if (!checkIsValidFilesSize(file, size)) {
        throw new Error("Exceed file size");
      }

      const response = await UploadServices.uploadFile({
        file: file,
        categoryId: "1", // Default category, can be made configurable
        type: "general",
        name: file.name,
      });

      if (onUploadSuccess) onUploadSuccess(file);

      fileList.current = fileList.current.map(
        (item) => {
          if (item.uid === file.uid) {
            item.id = response.id;
            item.path = response.path;
            item.extension = file.type
              .split("/")[1]
              ?.toUpperCase();
          }

          return item;
        }
      );

      setState({
        data: fileList.current,
        isPending: false,
        isSuccess: true,
        isError: false,
        error: "",
      });

      debouncedOnSuccess(fileList.current);
    } catch (error) {
      setState({
        isPending: false,
        isSuccess: false,
        isError: true,
        error:
          (error as Error).message ||
          "Failed to upload",
      });
      if (onUploadError)
        onUploadError(error as Error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }

    let list: TFileList[] = e?.fileList ?? [];
    if (list.length > maxCount) {
      list = (
        maxCount === 1
          ? list[list.length - 1]
          : list.slice(0, maxCount)
      ) as TFileList[];
    }

    fileList.current = list.map((item) => {
      const found = fileList.current.find(
        (file) => file.uid === item.uid
      );

      if (found) {
        item.id = found.id;
        item.path = found.path;
        item.extension = found.extension;
      }

      return item;
    });
    setState((s) => ({
      ...s,
      data: fileList.current,
    }));
    if (onChange) onChange(fileList.current);

    return list;
  };

  const EditFileButton = () => {
    const dataFileList = state.data ?? [];
    const hasData =
      dataFileList[0]?.url ||
      dataFileList[0]?.response;

    if (!hasData || state.isPending) {
      return (
        <Spin spinning={state.isPending}>
          <Flex vertical align="center" gap={4}>
            <UploadOutlined
              style={{
                fontSize: 41,
                color: "#00000073",
              }}
            />
            <Text>Upload</Text>
          </Flex>
        </Spin>
      );
    }

    if (hasData) {
      return (
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
        />
      );
    }
    return null;
  };

  const avatarUploadClassName = useMemo(() => {
    const isPending = state.isPending;
    const dataFileList = state.data ?? [];
    const hasData =
      dataFileList[0]?.url ||
      dataFileList[0]?.response;
    const editButtonStyle =
      !readOnly && hasData && !isPending
        ? "edit-button-uploader"
        : "";
    const pendingStyle =
      isPending || !hasData
        ? "avatar-uploader-hide-container"
        : "";
    const hideEditButton =
      readOnly && hasData
        ? "avatar-uploader-hide-select"
        : "";

    return `avatar-uploader ${editButtonStyle} ${pendingStyle} ${hideEditButton}`;
  }, [readOnly, state.isPending, state.data]);

  return {
    fileList: fileList.current,
    setFileList,
    beforeUpload,
    upload,
    normFile,
    EditFileButton,
    avatarUploadClassName,
  };
};

export default useUpload;
