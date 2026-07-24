'use client';

import { chatApi } from '@/api';
import { Message, ProposalData } from '@/types';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@repo/ui';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MessageCircleDashedIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ProposalCard } from './proposal-card';
import { ScrollIntoView } from '../scroll-into-view';

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

    // 1. Optimistically append user message
    const tempUserMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    setMessages((prev) => [
      ...prev,
      { id: tempUserMsgId, role: 'user', text: prompt },
      { id: assistantMsgId, role: 'assistant', text: '' }, // Placeholder for stream
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
      // Update onDone to accept the final saved message from the backend stream payload
      onDone: (data?: {
        assistantMessage?: {
          content: string;
          metadata?: Record<string, unknown>;
        };
      }) => {
        setIsStreaming(false);

        if (data?.assistantMessage) {
          // Store reference to narrowed object so TS knows it's defined inside the callback
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

        // Fallback: Client-side JSON extraction if backend didn't send assistantMessage payload
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
            } catch {
              // Plain text fallback
            }

            return msg;
          }),
        );
      },
    };

    // 2. Decide flow: Create Chat vs Send to Existing Chat
    if (!activeChatId) {
      await chatApi.createConversation(
        { initialMessage: prompt },
        streamCallbacks,
      );
    } else {
      await chatApi.sendMessageStream(activeChatId, prompt, streamCallbacks);
    }
  };

  const handleProposalConfirm = async (proposal: ProposalData) => {
    // Call your API service (e.g., categories service) to execute action
    console.log('Executing proposal:', proposal);
  };

  // Inside ChatContainer:
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Handle manual scrolling to toggle button visibility
  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;

    // Show button if user scrolled up more than 80px from bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 80;
    setShowScrollDown(isScrolledUp);
  };

  // Scroll smoothly to bottom when clicked
  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll or show button when messages change
  useEffect(() => {
    if (!viewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom) {
      scrollToBottom();
    } else {
      setShowScrollDown(true);
    }
  }, [messages, isStreaming]);

  return (
    <div className='flex flex-col flex-1 min-h-0 h-full'>
      <div className='flex-1 overflow-y-auto min-h-0 scrollbar-thin'>
        <MessageScrollerProvider>
          {messages.length === 0 ? (
            <div className='flex h-full items-center justify-center p-4'>
              <Empty className='p-0'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <MessageCircleDashedIcon />
                  </EmptyMedia>
                  <EmptyTitle className='text-sm font-medium'>
                    How can I help?
                  </EmptyTitle>
                  <EmptyDescription className='text-xs'>
                    Ask questions about orders, products, or core metrics.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <MessageScroller className='relative h-full'>
              <MessageScrollerViewport
                ref={viewportRef}
                onScroll={handleScroll}
                className='h-full overflow-y-auto'
              >
                <MessageScrollerContent className='p-4 space-y-3'>
                  {messages.map((msg, index) => {
                    // Check if this specific assistant message is currently streaming
                    const isThisMsgStreaming =
                      isStreaming &&
                      msg.role === 'assistant' &&
                      index === messages.length - 1;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        {/* Chat Bubble */}
                        <div
                          className={`animate-slide-up-fade rounded-2xl px-3.5 py-2 text-xs max-w-[85%] whitespace-pre-wrap shadow-sm transition-all duration-200 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-xs'
                              : 'bg-muted/80 text-foreground border border-border/40 rounded-bl-xs'
                          }`}
                        >
                          {isThisMsgStreaming ? (
                            /* Show ONLY loading dots while streaming */
                            <span className='inline-flex items-center gap-1 py-0.5'>
                              <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]' />
                              <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]' />
                              <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current' />
                            </span>
                          ) : (
                            /* Show text once stream finishes */
                            msg.text
                          )}
                        </div>

                        {/* Proposal Card appears at the exact same time as msg.text when streaming finishes */}
                        {!isThisMsgStreaming &&
                          msg.role === 'assistant' &&
                          msg.metadata?.type === 'proposal' &&
                          msg.metadata?.proposal && (
                            <div className='animate-slide-up-fade w-full max-w-[85%] mt-1.5'>
                              <ProposalCard proposal={msg.metadata.proposal} />
                            </div>
                          )}
                      </div>
                    );
                  })}
                </MessageScrollerContent>
              </MessageScrollerViewport>

              {/* Floating Scroll-to-Bottom Button */}
              {showScrollDown && (
                <button
                  onClick={scrollToBottom}
                  type='button'
                  aria-label='Scroll to bottom'
                  className='animate-slide-up-fade absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:bg-accent transition-all'
                >
                  <ArrowDownIcon className='h-4 w-4' />
                </button>
              )}
            </MessageScroller>
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
