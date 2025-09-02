import { Input, InputProps } from 'antd';

const STEInput = ({ maxLength = 254, onInput, ...rest }: InputProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInput = (e: any) => {
    if (e.target.value?.length > maxLength) {
      e.target.blur();
      setTimeout(() => {
        e.target.focus();
      }, 0);
    }

    if (onInput) onInput(e);
  };

  return <Input maxLength={maxLength} size="large" className="w-full" onInput={handleInput} {...rest} />;
};

export default STEInput;
