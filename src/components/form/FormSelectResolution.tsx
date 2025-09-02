import React from "react";
import { Form, Select } from "antd";
import { Rule } from "antd/es/form";

interface IProps {
  name: string;
  label?: string;
  rules?: Rule[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const FormSelectResolution: React.FC<IProps> = ({
  name,
  label,
  rules = [],
  disabled = false,
  placeholder = "Select resolution",
  required = false,
  className,
}) => {
  // Common resolution options
  const resolutionOptions = [
    { label: "1920x1080 (Full HD)", value: "1920x1080" },
    { label: "2560x1440 (2K)", value: "2560x1440" },
    { label: "3840x2160 (4K)", value: "3840x2160" },
    { label: "1366x768 (HD)", value: "1366x768" },
    { label: "1440x900 (WXGA+)", value: "1440x900" },
    { label: "1600x900 (HD+)", value: "1600x900" },
    { label: "1920x1200 (WUXGA)", value: "1920x1200" },
    { label: "2560x1600 (WQXGA)", value: "2560x1600" },
    { label: "3440x1440 (Ultrawide)", value: "3440x1440" },
    { label: "5120x2880 (5K)", value: "5120x2880" },
  ];

  const formRules = required
    ? [
        {
          required: true,
          message: "Please select resolution",
        },
        ...rules,
      ]
    : rules;

  return (
    <Form.Item
      name={name}
      label={label}
      rules={formRules}
      className={className}
    >
      <Select
        placeholder={placeholder}
        disabled={disabled}
        options={resolutionOptions}
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        size="large"
      />
    </Form.Item>
  );
};

export default FormSelectResolution;
