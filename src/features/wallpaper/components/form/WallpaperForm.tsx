import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Form, FormProps, Row, Col } from "antd";
import RequiredMark from "@/components/ui/RequiredMark";
import { Errors } from "@/data/constants";
import FormMedia from "@/components/form/FormMedia";
import FormInput from "@/components/form/FormInput";
import SelectCategory from "@/features/category/components/SelectCategory";
import { TFileType } from "@/hooks/useUpload";
import { TMimeType, TFormRef } from "@/data/type";

const defaultValues = {};

export type TForm = {
  categoryId: number;
  name: string;
  resolution: string;
  size: string;
  mime: TMimeType;
  tags: string;
  resourceFiles?: TFileType[];
  thumbFiles?: TFileType[];
};

type TProps = {
  loading?: boolean;
  readOnly?: boolean;
  errorCode?: Errors;
  onCancel?: () => void;
  onSubmit?: (
    values: TForm
  ) => void;
  initialValues?: TForm;
  isViewedFromOthers?: boolean;
};

const WallpaperForm = forwardRef<
  TFormRef,
  TProps
>(
  (
    {
      readOnly,
      onSubmit,
      initialValues = defaultValues as unknown as TForm,
    },
    ref
  ) => {
    const [form] = Form.useForm();
    const [resourceFiles, setResourceFiles] = useState<TFileType[]>([]);
    const [thumbFiles, setThumbFiles] = useState<TFileType[]>([]);

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }, [initialValues, form]);

    const onFinish: FormProps<TForm>["onFinish"] =
      async (values) => {
        if (!onSubmit) return;

        // Extract file information from the uploaded resource file
        const resourceFile = resourceFiles[0];
        if (resourceFile) {
          // Get file size
          const fileSizeInBytes = resourceFile.size || 0;
          const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2);
          const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
          const size = fileSizeInBytes > 1024 * 1024 ? `${fileSizeInMB} MB` : `${fileSizeInKB} KB`;

          // Get mime type
          const mimeType = resourceFile.type || 'image/jpeg';
          const mime: TMimeType = {
            type: "MimeType.Static" as const,
            value: mimeType
          };

          // Get resolution from image
          const getImageResolution = (file: File): Promise<string> => {
            return new Promise((resolve) => {
              const img = new Image();
              const url = URL.createObjectURL(file);
              img.onload = () => {
                const resolution = `${img.width}x${img.height}`;
                URL.revokeObjectURL(url);
                resolve(resolution);
              };
              img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve('1920x1080'); // Default resolution if image fails to load
              };
              img.src = url;
            });
          };

          // Get resolution
          const resolution = await getImageResolution(resourceFile);

          const payload: TForm = {
            ...values,
            resolution,
            size,
            mime,
            resourceFiles,
            thumbFiles,
          };

          onSubmit(payload);
        } else {
          // Handle case when no resource file is uploaded
          const payload: TForm = {
            ...values,
            resourceFiles,
            thumbFiles,
          };
          onSubmit(payload);
        }
      };

    useImperativeHandle(ref, () => ({
      submit: () => {
        form.submit();
      },
    }));

    const handleResourceFilesChange = (files: TFileType[]) => {
      setResourceFiles(files);
    };

    const handleThumbFilesChange = (files: TFileType[]) => {
      setThumbFiles(files);
    };

    return (
      <Form<TForm>
        form={form}
        initialValues={initialValues}
        disabled={readOnly}
        name="wallpaper"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        requiredMark={RequiredMark}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[
                {
                  required: true,
                  message: "Please select a category",
                },
              ]}
            >
              <SelectCategory
                placeholder="Select category"
                disabled={readOnly}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <FormInput
              name="name"
              label="Wallpaper Name"
              placeholder="Enter wallpaper name"
              required={true}
              disabled={readOnly}
            />
          </Col>
        </Row>

        <FormInput
          name="tags"
          label="Tags"
          placeholder="nature, sunset, landscape"
          required={true}
          disabled={readOnly}
        />

        <Row gutter={16}>
          <Col span={12}>
            <FormMedia
              name="resourceFiles"
              label="Resource File"
              className="medium"
              maxCount={1}
              form={form}
              multiple={false}
              onFilesChange={handleResourceFilesChange}
              rules={[
                {
                  required: true,
                  message: "Please upload resource file",
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <FormMedia
              name="thumbFiles"
              label="Thumbnail File"
              className="medium"
              maxCount={1}
              form={form}
              multiple={false}
              onFilesChange={handleThumbFilesChange}
              rules={[
                {
                  required: true,
                  message: "Please upload thumbnail file",
                },
              ]}
            />
          </Col>
        </Row>
      </Form>
    );
  }
);

WallpaperForm.displayName = "WallpaperForm";

export default WallpaperForm;
