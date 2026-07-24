import { api } from '@/lib/fetch';
import { baseUrl } from '@/lib/utils';
import { StreamCallbacks } from '@/types';

const path = `/chat`;

async function handleStreamResponse(
  response: Response,
  callbacks: StreamCallbacks,
) {
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/signin';
      return;
    }
    callbacks.onError?.(`HTTP error! status: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.('Failed to get response reader');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');

    // Keep the last incomplete fragment in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));

          switch (data.type) {
            case 'session_created':
              callbacks.onSessionCreated?.(data.session);
              break;
            case 'user_message_created':
              callbacks.onUserMessageCreated?.(data.userMessage);
              break;
            case 'token':
              callbacks.onToken(data.content);
              break;
            case 'done':
              callbacks.onDone?.(data.assistantMessage);
              break;
            case 'error':
              callbacks.onError?.(data.message);
              break;
          }
        } catch {
          // Skip malformed frame
        }
      }
    }
  }
}

export const chatApi = {
  createConversation: async (
    data: { title?: string; initialMessage?: string },
    callbacks: StreamCallbacks,
  ) => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Better Auth uses cookies
      body: JSON.stringify(data),
    });

    if (data.initialMessage) {
      await handleStreamResponse(res, callbacks);
    } else {
      const session = await res.json();
      callbacks.onSessionCreated?.(session);
    }
  },

  // Stream a message into an existing conversation
  sendMessageStream: async (
    chatId: string,
    content: string,
    callbacks: StreamCallbacks,
  ) => {
    const res = await fetch(`${baseUrl}/chat/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Better Auth uses cookies
      body: JSON.stringify({ content }),
    });

    await handleStreamResponse(res, callbacks);
  },

  getConversations: async () => {
    const url = path;
    return api.get(url);
  },
};
