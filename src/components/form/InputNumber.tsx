import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input, InputNumberProps, InputProps, InputRef } from 'antd';
import { removeCommas } from '../../utils/inputNumberEvent';

type TProps = Omit<InputProps, 'value' | 'onChange'> &
  Pick<InputNumberProps, 'value' | 'onChange'> & {
    max?: number;
    numberOnly?: boolean;
    allowNegative?: boolean; // New prop to enable negative numbers
  };

const InputNumber = ({
  maxLength = 15,
  max,
  numberOnly,
  allowNegative = false,
  onChange,
  onBlur,
  value,
  ...rest
}: TProps) => {
  const inputRef = useRef<InputRef>(null);
  const [inputValue, setInputValue] = useState<string | undefined>(
    (rest.defaultValue || value)?.toString() || undefined,
  );

  useEffect(() => {
    if (!Number.isNaN(value)) setInputValue(value as string);
  }, [value]);

  const formatNumberWithDot = (value: string, numberOnly: boolean | undefined, allowNegative: boolean) => {
    if (typeof value !== 'string') return value;

    // Allow negative sign if `allowNegative` is true
    const negativeSign = allowNegative ? '-' : '';
    let formattedValue = numberOnly
      ? value.replace(new RegExp(`[^0-9${negativeSign}]`, 'g'), '') // Allow negative sign if enabled
      : value.replace(new RegExp(`[^0-9.${negativeSign}]`, 'g'), '');

    if (!numberOnly) {
      const decimalIndex = formattedValue.indexOf('.');
      if (decimalIndex !== -1) {
        const decimalPart = formattedValue.slice(decimalIndex + 1).slice(0, 2);
        formattedValue = formattedValue.slice(0, decimalIndex + 1) + decimalPart;
      }
    }

    return formattedValue;
  };

  const formatNumberWithComma = (value: string, numberOnly: boolean | undefined, allowNegative: boolean) => {
    if (typeof value !== 'string') return value;

    let formattedValue = value;

    if (!numberOnly) {
      let [integerPart, decimalPart] = formattedValue.split('.');
      const isNegative = allowNegative && integerPart?.startsWith('-');
      if (isNegative) integerPart = integerPart?.slice(1);

      integerPart = (integerPart ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      if (isNegative) integerPart = `-${integerPart}`;
      decimalPart = formattedValue.includes('.') ? `.${decimalPart}` : '';
      formattedValue = integerPart + decimalPart;
    } else {
      formattedValue = formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return formattedValue;
  };

  const formatNumber = useCallback(
    (value: string, numberOnly: boolean | undefined, allowNegative: boolean) => {
      if (typeof value !== 'string') return value;

      let formattedValue = formatNumberWithDot(value, numberOnly, allowNegative);

      if (maxLength) {
        formattedValue = formattedValue.slice(0, maxLength);
      }

      if (max !== undefined && parseFloat(formattedValue) > max) {
        formattedValue = max.toString();
      }

      formattedValue = formatNumberWithComma(formattedValue, numberOnly, allowNegative);

      return formattedValue ?? undefined;
    },
    [max, maxLength],
  );

  const handleInputChange: InputProps['onChange'] = (e) => {
    const input = e.target;
    const value = (input.value || '').replace(/[^\d.,-]/g, ''); // Allow negative sign

    setInputValue(value);

    const cursorPosition = input.selectionStart || 0;

    const formattedValue = formatNumber(value, numberOnly, allowNegative);

    if (onChange) {
      const changedValue =
        formattedValue &&
        (formattedValue[formattedValue.length - 1] === '.' ? formattedValue : Number(removeCommas(formattedValue)));

      onChange(changedValue);
    }

    const commaCountBefore = (value.slice(0, cursorPosition).match(/,/g) || []).length;
    const commaCountAfter = (formattedValue.slice(0, cursorPosition).match(/,/g) || []).length;
    const newCursorPosition = cursorPosition + (commaCountAfter - commaCountBefore);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const handleBlur: InputProps['onBlur'] = (e) => {
    handleInputChange({ ...e, target: { ...e.target, value: (e.target.value || '').replace(/\.+$/, '') ?? '' } });
    if (onBlur) onBlur(e);
  };

  return (
    <Input
      {...rest}
      ref={inputRef}
      value={formatNumber((inputValue ?? '').toString(), numberOnly, allowNegative)}
      size="large"
      className="w-full"
      onChange={handleInputChange}
      onBlur={handleBlur}
    />
  );
};

export default InputNumber;
