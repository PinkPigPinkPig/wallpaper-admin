import { Button, ButtonProps, Flex } from 'antd';
import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

type TProps = ButtonProps & {
  text?: string;
};

const ButtonCancel = ({ text = 'Cancel', ...props }: TProps) => {

  return (
    <Button {...props}>
      <Flex gap={8}>
        <CloseOutlined />
        <span>{text}</span>
      </Flex>
    </Button>
  );
};

export default ButtonCancel;
