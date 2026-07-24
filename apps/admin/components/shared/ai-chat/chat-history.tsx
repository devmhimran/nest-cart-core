'use client';

import { useState } from 'react';

import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useGetAiChat } from '@/hooks/use-ai-chat';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from '@repo/ui';

export interface ChatSession {
  id: string;
  title?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  _count?: number | { messages?: number };
}

export function ChatHistory() {
  const { fetchAiChatsMutationData } = useGetAiChat();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const chats: ChatSession[] = Array.isArray(fetchAiChatsMutationData?.data)
    ? fetchAiChatsMutationData.data
    : [];

  const formatRelativeTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    // 1. Outer wrapper MUST have defined height constraint (e.g., h-screen or h-full)
    <aside className='w-full max-w-sm h-screen flex flex-col border-r bg-background/50 backdrop-blur-md overflow-hidden'>
      {/* Header (shrink-0 keeps it fixed at top) */}
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

      {/* 2. Scrollable Section (flex-1 + min-h-0 lets it shrink and trigger scroll) */}
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
                const count =
                  typeof chat._count === 'number'
                    ? chat._count
                    : (chat._count?.messages ?? 0);
                const isSelected = selectedId === chat.id;

                return (
                  <Card
                    key={chat.id}
                    onClick={() => setSelectedId(chat.id)}
                    className={`mx-1 group relative border transition-all duration-150 cursor-pointer shadow-none hover:shadow-sm ${
                      isSelected
                        ? 'bg-accent border-accent-foreground/10 text-accent-foreground'
                        : 'border-transparent bg-transparent hover:bg-muted/60'
                    }`}
                  >
                    <CardContent className='p-2.5'>
                      <div className='flex items-start justify-between gap-2'>
                        {/* Title & Info */}
                        <div className='flex items-start gap-2.5 min-w-0 flex-1'>
                          <MessageSquare
                            className={`h-4 w-4 mt-0.5 shrink-0 transition-colors ${
                              isSelected
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-foreground'
                            }`}
                          />
                          <div className='min-w-0 flex-1'>
                            <h4 className='text-xs font-medium leading-tight truncate text-foreground'>
                              {chat.title || 'Untitled Conversation'}
                            </h4>

                            <div className='flex items-center gap-2 mt-1 text-[11px] text-muted-foreground'>
                              <span className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                {formatRelativeTime(
                                  chat.lastMessageAt || chat.updatedAt,
                                )}
                              </span>
                              {count > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{count} msgs</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Three Dots Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-foreground shrink-0 -mr-1'
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className='h-3.5 w-3.5' />
                                <span className='sr-only'>Chat options</span>
                              </Button>
                            }
                          ></DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-36'>
                            <DropdownMenuItem
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Pencil className='h-3.5 w-3.5 mr-2' />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-destructive focus:text-destructive'
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className='h-3.5 w-3.5 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
