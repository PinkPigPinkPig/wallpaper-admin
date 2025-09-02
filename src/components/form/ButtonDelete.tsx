import { Button, ButtonProps, Flex } from 'antd';
import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';

const ButtonDelete = (props: ButtonProps) => {

  return (
    <Button {...props} type="primary" danger>
      <Flex gap={8}>
        <DeleteOutlined />
        <span>Delete</span>
      </Flex>
    </Button>
  );
};

export default ButtonDelete;
