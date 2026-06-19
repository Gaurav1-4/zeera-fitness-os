import { UIMessage, CreateUIMessage } from '@ai-sdk/react';
const msg: CreateUIMessage<UIMessage> = {
  role: 'user',
  parts: [{ type: 'text', text: 'Hello' }]
};
