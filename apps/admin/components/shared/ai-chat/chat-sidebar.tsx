'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { XIcon, BotIcon, PlusIcon } from 'lucide-react';

import {
  getSavedActiveChat,
  saveActiveChat,
  updateActiveChatTimestamp,
} from '@/lib/chat-session';
import { ChatHistory } from './chat-history';
import { ChatContainer } from './chat-container';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const saved = getSavedActiveChat();
    if (saved.expired || !saved.chatId) return null;
    return saved.chatId;
  });
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        const saved = getSavedActiveChat();
        if (saved.expired) {
          toast.info(
            'Previous chat session expired after 3 hours. Started a new chat.',
          );
          setActiveChatId(null);
        } else if (saved.chatId) {
          setActiveChatId(saved.chatId);
          updateActiveChatTimestamp();
        } else {
          setActiveChatId(null);
        }
      });
    }
  }, [open]);

  const handleClose = () => {
    if (activeChatId) {
      updateActiveChatTimestamp();
    }
    onClose();
  };

  const handleChatCreated = (newChatId: string) => {
    setActiveChatId(newChatId);
    saveActiveChat(newChatId);
  };

  const handleSelectChatFromHistory = (chatId: string) => {
    setActiveChatId(chatId);
    saveActiveChat(chatId);
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    saveActiveChat(null);
    setActiveTab('chat');
  };

  return (
    <aside
      className={`relative flex flex-col h-full border-l bg-background transition-all duration-300 ease-in-out ${
        open
          ? 'w-80 opacity-100 visible'
          : 'w-0 opacity-0 invisible overflow-hidden border-none'
      }`}
    >
      <div className='flex flex-col h-full w-80 min-h-0'>
        {/* Header */}
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

          <div className='flex items-center gap-1'>
            {activeChatId && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-muted-foreground hover:text-foreground'
                onClick={handleNewChat}
                title='Start New Conversation'
              >
                <PlusIcon className='h-4 w-4' />
              </Button>
            )}
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={handleClose}
            >
              <XIcon className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            const nextTab = val as 'chat' | 'history';
            if (nextTab === 'chat') {
              const saved = getSavedActiveChat();
              if (saved.expired) {
                toast.info(
                  'Previous session expired after 3 hours. Started a new chat.',
                );
                setActiveChatId(null);
              }
            }
            setActiveTab(nextTab);
          }}
          className='p-2 flex flex-col flex-1 min-h-0'
        >
          <TabsList className='w-full shrink-0'>
            <TabsTrigger value='chat' className='w-full'>
              Chat
            </TabsTrigger>
            <TabsTrigger value='history' className='w-full'>
              History
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab Content */}
          <TabsContent
            value='chat'
            className='flex-1 flex flex-col min-h-0 mt-2 data-[state=inactive]:hidden'
          >
            <ChatContainer
              chatId={activeChatId}
              onChatCreated={handleChatCreated}
            />
          </TabsContent>

          {/* History Tab Content */}
          <TabsContent
            value='history'
            className='flex-1 flex flex-col min-h-0 mt-2 data-[state=inactive]:hidden'
          >
            <ChatHistory
              activeChatId={activeChatId}
              onSelectChat={handleSelectChatFromHistory}
              onNewChat={handleNewChat}
            />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
