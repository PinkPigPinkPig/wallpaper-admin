import { Flex } from 'antd';
import { TitleProps } from 'antd/es/typography/Title';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  InfoCircleFilled,
} from '@ant-design/icons';

type TProps = {
  type: TitleProps['type'];
  text: string;
};

const ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />,
  danger: <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 20 }} />,
  warning: <WarningFilled style={{ color: '#faad14', fontSize: 20 }} />,
  secondary: <InfoCircleFilled style={{ color: '#1677ff', fontSize: 20 }} />,
};

function Message({ type, text }: TProps) {
  const icon = type ? (ICONS[type] ?? ICONS.secondary) : ICONS.secondary;

  return (
    <Flex align="center" gap={10}>
      {icon}
      <span style={{ fontSize: 15, color: '#262626', lineHeight: 1.4 }}>
        {text}
      </span>
    </Flex>
  );
}

export default Message;
