"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Form, FormProps, Row, Col } from "antd";
import RequiredMark from "@/components/ui/RequiredMark";
import FormInput from "@/components/form/FormInput";
import FormMedia from "@/components/form/FormMedia";
import { TFormRef } from "@/data/type";
import { TFileType } from "@/hooks/useUpload";

const defaultValues = {};

export interface TCategoryForm {
  name: string;
  thumbFiles?: TFileType[];
}

interface CategoryFormProps {
  onSubmit?: (values: TCategoryForm) => void;
  readOnly?: boolean;
  initialValues?: Partial<TCategoryForm>;
}

const CategoryForm = forwardRef<TFormRef, CategoryFormProps>(
  ({ onSubmit, readOnly = false, initialValues = defaultValues as unknown as TCategoryForm }, ref) => {
    const [form] = Form.useForm();
    const [thumbFiles, setThumbFiles] = useState<TFileType[]>([]);

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }, [initialValues, form]);

    const onFinish: FormProps<TCategoryForm>["onFinish"] = async (values) => {
      if (!onSubmit) return;

      const payload: TCategoryForm = {
        ...values,
        thumbFiles,
      };

      onSubmit(payload);
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        form.submit();
      },
    }));

    const handleThumbFilesChange = (files: TFileType[]) => {
      setThumbFiles(files);
    };

    return (
      <Form<TCategoryForm>
        form={form}
        initialValues={initialValues}
        disabled={readOnly}
        name="category"
        layout="vertical"
        autoComplete="off"
        validateTrigger="onBlur"
        requiredMark={RequiredMark}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={24}>
            <FormInput
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required={true}
              disabled={readOnly}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
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

CategoryForm.displayName = "CategoryForm";

export default CategoryForm;
