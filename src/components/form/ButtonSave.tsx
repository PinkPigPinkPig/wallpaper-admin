import { Button, ButtonProps, Flex } from 'antd';
import React from 'react';
import { SaveOutlined } from '@ant-design/icons';

const ButtonSave = (props: ButtonProps) => {

  return (
    <Button {...props} type="primary">
      <Flex gap={8}>
        <SaveOutlined />
        <span>Save</span>
      </Flex>
    </Button>
  );
};

export default ButtonSave;
