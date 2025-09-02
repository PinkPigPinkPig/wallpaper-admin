import { Flex } from 'antd';
import React from 'react';
import Show from '../ui/Show';
import Text from 'antd/es/typography/Text';

const RequiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
  <Flex gap={4}>
    <Text>{label}</Text>
    <Show when={required}>
      <Text type="danger" style={{ fontFamily: 'SimSun,sans-serif' }}>
        *
      </Text>
    </Show>
  </Flex>
);

export default RequiredMark;
