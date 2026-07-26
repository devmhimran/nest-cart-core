'use client';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Button,
} from '@repo/ui';
import {
  Sparkles,
  MessageSquarePlus,
  ShoppingBag,
  BarChart3,
  Package,
  Users,
} from 'lucide-react';

interface ChatContainerEmptyStateProps {
  onStartConversation?: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    icon: BarChart3,
    text: "What are today's sales and metrics?",
  },
  {
    icon: Package,
    text: 'Show low stock inventory items',
  },
  {
    icon: ShoppingBag,
    text: 'Summarize recent orders status',
  },
  {
    icon: Users,
    text: 'Show customer growth this month',
  },
];

export function ChatContainerEmptyState({
  onStartConversation,
  onSelectPrompt,
}: ChatContainerEmptyStateProps) {
  return (
    <div className='flex flex-col h-full items-center justify-center p-4 text-center'>
      <Empty className='p-0 max-w-sm'>
        <EmptyHeader className='items-center'>
          <EmptyMedia
            variant='icon'
            className='h-12 w-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm'
          >
            <Sparkles className='h-6 w-6' />
          </EmptyMedia>
          <EmptyTitle className='text-base font-semibold mt-2'>
            Nest Cart AI Assistant
          </EmptyTitle>
          <EmptyDescription className='text-xs text-muted-foreground max-w-xs mt-1'>
            Ask questions about orders, products, sales performance, or core
            metrics.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <div className='mt-5 w-full max-w-xs flex flex-col gap-3'>
        <Button
          onClick={onStartConversation}
          size='sm'
          className='w-full gap-2 shadow-sm font-medium transition-all hover:scale-[1.02]'
        >
          <MessageSquarePlus className='h-4 w-4' />
          Start Conversation
        </Button>

        <div className='mt-2 space-y-1.5 text-left'>
          <p className='text-[11px] font-medium text-muted-foreground/80 px-1 uppercase tracking-wider'>
            Or try asking:
          </p>
          <div className='grid grid-cols-1 gap-1.5'>
            {SAMPLE_PROMPTS.map((sample, idx) => {
              const Icon = sample.icon;
              return (
                <button
                  key={idx}
                  type='button'
                  onClick={() => onSelectPrompt?.(sample.text)}
                  className='flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-foreground/80 bg-muted/40 border border-border/40 hover:bg-accent hover:text-foreground transition-all duration-150 text-left group'
                >
                  <Icon className='h-3.5 w-3.5 text-primary shrink-0 transition-transform group-hover:scale-110' />
                  <span className='truncate'>{sample.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
