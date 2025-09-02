import { Button, ButtonProps, Flex } from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';

const ButtonCreate = (props: ButtonProps) => {

  return (
    <Button {...props} type="primary">
      <Flex gap={8}>
        <PlusOutlined />
        <span>Create</span>
      </Flex>
    </Button>
  );
};

export default ButtonCreate;
