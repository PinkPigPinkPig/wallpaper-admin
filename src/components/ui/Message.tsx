import { Typography } from 'antd';

type TProps = {
  text: string;
};

function Message({ text }: TProps) {
  return (
    <Typography.Text style={{ fontSize: 15 }}>
      {text}
    </Typography.Text>
  );
}

export default Message;
