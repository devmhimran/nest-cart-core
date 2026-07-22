'use client';

import {
  XIcon,
  BotIcon,
  ArrowUpIcon,
  MessageCircleDashedIcon,
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@repo/ui';

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; text: string }>
  >([]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: 'This is a UI placeholder response.',
        },
      ]);
    }, 600);
  };

  return (
    <aside
      className={`relative flex flex-col h-full border-l bg-background transition-all duration-300 ease-in-out ${
        open
          ? 'w-80 opacity-100 visible'
          : 'w-0 opacity-0 invisible overflow-hidden border-none'
      }`}
    >
      <div className='flex flex-col h-full w-80'>
        <div className='flex items-center justify-between border-b p-3 shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <BotIcon className='h-4 w-4' />
            </div>
            <div>
              <h2 className='text-sm font-semibold leading-none'>
                AI Assistant
              </h2>
              <p className='text-xs text-muted-foreground mt-0.5'>
                Nest Cart Copilot
              </p>
            </div>
          </div>

          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </Button>
        </div>

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
              <MessageScroller className='h-full'>
                <MessageScrollerViewport>
                  <MessageScrollerContent className='p-4 space-y-3'>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
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
                  disabled={!input.trim()}
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
    </aside>
  );
}
