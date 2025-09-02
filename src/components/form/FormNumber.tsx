import FormItem, { FormItemProps } from 'antd/es/form/FormItem';
import { NamePath } from 'antd/es/form/interface';
import { ReactNode } from 'react';
import InputNumber from './InputNumber';
import { ConfigProvider } from 'antd';

interface IProps<TForm> extends Omit<FormItemProps, 'name'> {
  name: keyof TForm | NamePath;
  placeholder?: string;
  className?: string;
  addonAfter?: ReactNode;
  readOnly?: boolean;
  disabled?: boolean;
  numberOnly?: boolean;
  allowNegative?: boolean;
  max?: number;
  maxLength?: number;
}

const FormNumber = <TForm,>({
  name,
  placeholder,
  className,
  addonAfter,
  readOnly,
  disabled,
  numberOnly,
  allowNegative,
  max,
  maxLength,
  ...rest
}: IProps<TForm>) => {
  const { componentDisabled } = ConfigProvider.useConfig();

  return (
    <FormItem<TForm> name={name} className={`custom-error-margin ${className}`} {...rest}>
      <InputNumber
        numberOnly={numberOnly}
        disabled={disabled || componentDisabled}
        readOnly={readOnly}
        maxLength={maxLength}
        addonAfter={addonAfter}
        placeholder={placeholder}
        allowNegative={allowNegative}
        max={max}
      />
    </FormItem>
  );
};

export default FormNumber;
