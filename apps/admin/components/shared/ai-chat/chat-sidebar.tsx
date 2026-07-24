'use client';

import { XIcon, BotIcon } from 'lucide-react';

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { ChatContainer } from './chat-container';
import { ChatHistory } from './chat-history';
import { useState } from 'react';

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  // 1. Keep track of current selected chat & active tab
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  // Callback when user creates a brand new chat
  const handleChatCreated = (newChatId: string) => {
    setActiveChatId(newChatId);
  };

  // Callback when user selects a past chat from History tab
  const handleSelectChatFromHistory = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveTab('chat'); // Automatically switch back to chat view
  };

  // Callback when user clicks "+ New Chat"
  const handleNewChat = () => {
    setActiveChatId(null);
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

          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onClose}
          >
            <XIcon className='h-4 w-4' />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'chat' | 'history')}
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
            {/* PASS PROPS HERE */}
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
            // activeChatId={activeChatId}
            // onSelectChat={handleSelectChatFromHistory}
            // onNewChat={handleNewChat}
            />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
