import { message } from 'antd';
import type { NoticeType } from 'antd/es/message/interface';
import { useEffect } from 'react';
import Message from './Message';
import { TitleProps } from 'antd/es/typography/Title';

export type TMessage = {
  id: string;
  type: NoticeType;
  text: string;
};

export type TMessageEvent = MessageEvent<{
  source: string;
  payload: TMessage;
}>;

export const MSG_SOURCE = 'ste-message';

const convertType: Record<NoticeType, TitleProps['type']> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'secondary',
  loading: 'secondary',
};

export function postMessageHandler(params: TMessage) {
  const message = {
    source: MSG_SOURCE,
    payload: params,
  };

  window.postMessage(message, window.origin);
}

function ToastMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const handleMessage = (event: TMessageEvent) => {
      const { data } = event;
      if (event.origin === window.origin && data.source === MSG_SOURCE) {
        const text = data.payload.text;

        messageApi.open({
          key: data.payload.id,
          type: data.payload.type,
          duration: 5,
          content: <Message type={convertType[data.payload.type]} text={text} />,
          onClose: () => messageApi.destroy(data.payload.id),
          style: {
            position: 'absolute',
            right: 20,
          },
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [messageApi]);

  return <div>{contextHolder}</div>;
}

export default ToastMessage;
