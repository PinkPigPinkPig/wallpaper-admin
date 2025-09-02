import { Button, ButtonProps, Flex } from 'antd';
import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

type TProps = ButtonProps & {
  text?: string;
};

const ButtonConfirm = ({ text = 'confirm', ...props }: TProps) => {

  return (
    <Button {...props} type="primary">
      <Flex gap={8}>
        <CheckOutlined />
        <span>{text}</span>
      </Flex>
    </Button>
  );
};

export default ButtonConfirm;
