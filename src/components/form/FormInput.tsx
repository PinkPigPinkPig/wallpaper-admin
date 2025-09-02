import React from "react";
import { Form, Input } from "antd";
import { Rule } from "antd/es/form";

interface IProps {
  name: string;
  label?: string;
  rules?: Rule[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: "text" | "password" | "email" | "number" | "url";
  maxLength?: number;
  showCount?: boolean;
  allowClear?: boolean;
}

const FormInput: React.FC<IProps> = ({
  name,
  label,
  rules = [],
  disabled = false,
  placeholder,
  required = false,
  className,
  type = "text",
  maxLength,
  showCount = false,
  allowClear = true,
}) => {
  const formRules = required
    ? [
        {
          required: true,
          message: `Please enter ${label?.toLowerCase() || "this field"}`,
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
      required={required}
    >
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        showCount={showCount}
        allowClear={allowClear}
        size="large"
      />
    </Form.Item>
  );
};

export default FormInput;
