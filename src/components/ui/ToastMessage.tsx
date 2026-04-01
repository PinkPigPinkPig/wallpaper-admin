'use client';

import { message } from 'antd';
import type { NoticeType } from 'antd/es/message/interface';
import { useEffect } from 'react';
import Message from './Message';

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

export function postMessageHandler(params: TMessage) {
  window.postMessage({ source: MSG_SOURCE, payload: params }, window.origin);
}

function ToastMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const handleMessage = (event: TMessageEvent) => {
      if (event.origin === window.origin && event.data.source === MSG_SOURCE) {
        const { id, type, text } = event.data.payload;

        messageApi.open({
          key: id,
          type,
          duration: 5,
          content: <Message text={text} />,
          onClose: () => messageApi.destroy(id),
          style: { position: 'absolute', right: 20 },
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [messageApi]);

  return <div>{contextHolder}</div>;
}

export default ToastMessage;
