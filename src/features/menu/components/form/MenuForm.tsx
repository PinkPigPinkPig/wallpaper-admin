"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Form, InputNumber, Select } from "antd";
import { TFormRef } from "@/data/type";
import { FilterType, QueryOrder } from "../../data/type";

export interface TMenuForm {
  filter: FilterType;
  index_in_page: number;
  page: number;
  queryOrder: QueryOrder;
}

interface MenuFormProps {
  onSubmit?: (values: TMenuForm) => void;
  readOnly?: boolean;
  initialValues?: Partial<TMenuForm>;
}

const MenuForm = forwardRef<TFormRef, MenuFormProps>(
  ({ onSubmit, readOnly = false, initialValues }, ref) => {
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      submit: () => {
        form.submit();
      },
    }));

    const handleSubmit = (values: TMenuForm) => {
      onSubmit?.(values);
    };

    const filterOptions = Object.values(FilterType).map(value => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value: value,
    }));

    const queryOrderOptions = Object.values(QueryOrder).map(value => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value: value,
    }));

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        disabled={readOnly}
      >
        <Form.Item
          label="Filter"
          name="filter"
          rules={[{ required: true, message: "Please select filter type" }]}
        >
          <Select
            placeholder="Select filter type"
            options={filterOptions}
          />
        </Form.Item>

        <Form.Item
          label="Query Order"
          name="queryOrder"
          rules={[{ required: true, message: "Please select query order" }]}
        >
          <Select
            placeholder="Select query order"
            options={queryOrderOptions}
          />
        </Form.Item>

        <Form.Item
          label="Page"
          name="page"
          rules={[{ required: true, message: "Please enter page number" }]}
        >
          <InputNumber 
            placeholder="Enter page number" 
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="Index in Page"
          name="index_in_page"
          rules={[{ required: true, message: "Please enter index in page" }]}
        >
          <InputNumber 
            placeholder="Enter index in page" 
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    );
  }
);

MenuForm.displayName = "MenuForm";

export default MenuForm;
