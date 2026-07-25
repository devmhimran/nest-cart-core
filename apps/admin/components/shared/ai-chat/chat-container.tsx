'use client';

import { chatApi } from '@/api';
import { Message } from '@/types';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  MessageScrollerProvider,
} from '@repo/ui';
import { ArrowUpIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { ChatMessageScroller } from './chat-message-scroller';
import { ChatContainerEmptyState } from './chat-container-empty-state';

interface ChatContainerProps {
  chatId?: string | null;
  onChatCreated?: (newChatId: string) => void;
}

export function ChatContainer({
  chatId: initialChatId,
  onChatCreated,
}: ChatContainerProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialChatId ?? null,
  );
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    const tempUserMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: tempUserMsgId, role: 'user', text: prompt },
      { id: assistantMsgId, role: 'assistant', text: '' },
    ]);

    const streamCallbacks = {
      onSessionCreated: (session: { id: string }) => {
        setActiveChatId(session.id);
        onChatCreated?.(session.id);
      },
      onToken: (token: string) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: msg.text + token }
              : msg,
          ),
        );
      },
      onError: (error: string) => {
        console.error('Stream Error:', error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: msg.text || 'An error occurred.' }
              : msg,
          ),
        );
        setIsStreaming(false);
      },
      onDone: (data?: {
        assistantMessage?: {
          content: string;
          metadata?: Record<string, unknown>;
        };
      }) => {
        setIsStreaming(false);

        if (data?.assistantMessage) {
          const assistantMessage = data.assistantMessage;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    text: assistantMessage.content,
                    metadata: assistantMessage.metadata,
                  }
                : msg,
            ),
          );
          return;
        }

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== assistantMsgId) return msg;

            try {
              const sanitized = msg.text
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();

              const parsed = JSON.parse(sanitized);

              if (parsed && typeof parsed === 'object' && parsed.message) {
                return {
                  ...msg,
                  text: parsed.message,
                  metadata: parsed.metadata,
                };
              }
            } catch {}

            return msg;
          }),
        );
      },
    };

    if (!activeChatId) {
      await chatApi.createConversation(
        { initialMessage: prompt },
        streamCallbacks,
      );
    } else {
      await chatApi.sendMessageStream(activeChatId, prompt, streamCallbacks);
    }
  };

  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;

    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollDown(isScrolledUp);
  };

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom) {
      const raf = requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'auto',
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setShowScrollDown(true);
    }
  }, [messages, isStreaming]);

  return (
    <div className='flex flex-col flex-1 min-h-0 h-full'>
      <div className='flex-1 overflow-y-auto min-h-0 scrollbar-thin'>
        <MessageScrollerProvider>
          {messages.length === 0 ? (
            <ChatContainerEmptyState />
          ) : (
            <ChatMessageScroller
              messages={messages}
              isStreaming={isStreaming}
              viewportRef={viewportRef}
              handleScroll={handleScroll}
              showScrollDown={showScrollDown}
              scrollToBottom={scrollToBottom}
            />
          )}
        </MessageScrollerProvider>
      </div>

      <div className='border-t p-3 shrink-0 bg-background mt-auto'>
        <form onSubmit={handleSend} className='w-full'>
          <InputGroup>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder='Type a message...'
              rows={2}
              className='w-full resize-none bg-transparent px-3 py-2 text-xs focus:outline-none placeholder:text-muted-foreground'
            />
            <InputGroupAddon align='block-end' className='p-1 pt-0'>
              <InputGroupButton
                type='submit'
                variant='default'
                size='icon-sm'
                disabled={!input.trim() || isStreaming}
                className='ml-auto h-7 w-7'
              >
                <ArrowUpIcon className='h-3.5 w-3.5' />
                <span className='sr-only'>Send</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}
