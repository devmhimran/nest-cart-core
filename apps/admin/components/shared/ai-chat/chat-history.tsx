'use client';

import { useState } from 'react';

import { MessageSquare, Sparkles } from 'lucide-react';
import { useGetAiChat } from '@/hooks/use-ai-chat';
import { Badge, ScrollArea } from '@repo/ui';
import { ChatHistoryCard } from './chat-history-card';
import { AiChatConversation } from '@/types';

export function ChatHistory() {
  const { fetchAiChatsMutationData } = useGetAiChat();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const chats: AiChatConversation[] = Array.isArray(
    fetchAiChatsMutationData?.data,
  )
    ? fetchAiChatsMutationData.data
    : [];

  return (
    <aside className='w-full max-w-sm h-screen flex flex-col border-r bg-background/50 backdrop-blur-md overflow-hidden'>
      <div className='p-4 border-b flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-lg bg-primary/10 text-primary'>
            <Sparkles className='h-4 w-4' />
          </div>
          <span className='font-semibold text-sm text-foreground'>
            Recent Chats
          </span>
        </div>
        <Badge
          variant='secondary'
          className='rounded-full px-2 py-0.5 text-xs font-normal'
        >
          {chats.length}
        </Badge>
      </div>

      <div className='flex-1 min-h-0'>
        <ScrollArea className='h-full p-2'>
          {chats.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center text-muted-foreground'>
              <MessageSquare className='h-8 w-8 mb-2 stroke-[1.5] opacity-50' />
              <p className='text-sm font-medium'>No chat history</p>
              <p className='text-xs text-muted-foreground/80'>
                Start a new conversation to see it here.
              </p>
            </div>
          ) : (
            <div className='space-y-1.5 pr-3'>
              {chats.map((chat) => {
                const isSelected = selectedId === chat.id;

                return (
                  <ChatHistoryCard
                    key={chat.id}
                    chat={chat}
                    isSelected={isSelected}
                    onSelect={(id) => setSelectedId(id as string)}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
