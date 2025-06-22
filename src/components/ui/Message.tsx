import { Space } from 'antd';
import Title, { TitleProps } from 'antd/es/typography/Title';
import Text from 'antd/es/typography/Text';

type TProps = {
  type: TitleProps['type'];
  text: string;
};

function Message({ type, text }: TProps) {

  return (
    <Space align="center">
      <Title level={5} type={type} className="m-0 mr-10 no-wrap">
        {text}
      </Title>
      <Text>{text}</Text>
    </Space>
  );
}

export default Message;
