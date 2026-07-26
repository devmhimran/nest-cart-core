'use client';

import { chatApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { updateActiveChatTimestamp } from '@/lib/chat-session';
import { ChatMessagePayload, Message } from '@/types';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  MessageScrollerProvider,
} from '@repo/ui';
import { ArrowUpIcon, Loader2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChatMessageScroller } from './chat-message-scroller';
import { ChatContainerEmptyState } from './chat-container-empty-state';

interface ChatContainerProps {
  chatId?: string | null;
  onChatCreated?: (newChatId: string) => void;
}

const queryClient = getQueryClient();

export function ChatContainer({ chatId, onChatCreated }: ChatContainerProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const createdChatIdRef = useRef<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    if (createdChatIdRef.current && createdChatIdRef.current === chatId) {
      return;
    }

    if (!chatId) return;

    let isSubscribed = true;

    chatApi
      .getConversation(chatId)
      .then((res) => {
        if (!isSubscribed) return;
        const conv = res?.data?.data ?? res?.data;
        if (conv?.messages && Array.isArray(conv.messages)) {
          const loadedMessages: Message[] = conv.messages.map(
            (msg: ChatMessagePayload) => ({
              id: msg.id,
              role: msg.role.toLowerCase() as 'user' | 'assistant',
              text: msg.content,
              metadata: msg.metadata,
            }),
          );
          setMessages(loadedMessages);
          updateActiveChatTimestamp();
        } else {
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load conversation history:', err);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoadingMessages(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [chatId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    setInput('');
    setIsStreaming(true);
    updateActiveChatTimestamp();

    const tempUserMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: tempUserMsgId, role: 'user', text: prompt },
      { id: assistantMsgId, role: 'assistant', text: '' },
    ]);

    const targetChatId = chatId;

    const streamCallbacks = {
      onSessionCreated: (session: { id: string }) => {
        createdChatIdRef.current = session.id;
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
        createdChatIdRef.current = null;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: msg.text || 'An error occurred while streaming.',
                }
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
        createdChatIdRef.current = null;
        setIsStreaming(false);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });

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

    if (!targetChatId) {
      await chatApi.createConversation(
        { initialMessage: prompt },
        streamCallbacks,
      );
    } else {
      await chatApi.sendMessageStream(targetChatId, prompt, streamCallbacks);
    }
  };

  const handleStartConversation = () => {
    textareaRef.current?.focus();
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

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
      requestAnimationFrame(() => {
        setShowScrollDown(true);
      });
    }
  }, [messages, isStreaming]);

  return (
    <div className='flex flex-col flex-1 min-h-0 h-full'>
      <div className='flex-1 overflow-y-auto min-h-0 scrollbar-thin relative'>
        <MessageScrollerProvider>
          {isLoadingMessages ? (
            <div className='flex h-full items-center justify-center text-xs text-muted-foreground gap-2 py-12'>
              <Loader2 className='h-4 w-4 animate-spin text-primary' />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <ChatContainerEmptyState
              onStartConversation={handleStartConversation}
              onSelectPrompt={handleSelectPrompt}
            />
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
              ref={textareaRef}
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
                disabled={!input.trim() || isStreaming || isLoadingMessages}
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
