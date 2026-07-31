import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerViewport,
} from '@repo/ui';
import { ArrowDownIcon } from 'lucide-react';
import { ProposalCard } from './proposal-card';
import { Message, ProposalData } from '@/types';
import { ScrollIntoView } from '../scroll-into-view';

interface ChatMessageScrollerProps {
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  handleScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  messages: Message[];
  isStreaming?: boolean;
  showScrollDown?: boolean;
  scrollToBottom?: () => void;
}

export function ChatMessageScroller({
  viewportRef,
  handleScroll,
  messages,
  isStreaming,
  showScrollDown,
  scrollToBottom,
}: ChatMessageScrollerProps) {
  const handleProposalConfirm = async (proposal: ProposalData) => {
    console.log('Executing proposal:', proposal);
  };

  return (
    <MessageScroller className='relative h-full'>
      <MessageScrollerViewport
        ref={viewportRef}
        onScroll={handleScroll}
        className='h-full overflow-y-auto'
      >
        <MessageScrollerContent className='p-4 space-y-3'>
          {messages.map((msg, index) => {
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
                <div
                  className={`animate-slide-up-fade rounded-2xl px-3.5 py-2 text-xs max-w-[85%] whitespace-pre-wrap  transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-xs'
                      : 'bg-muted/80 text-foreground border border-border/40 rounded-bl-xs'
                  }`}
                >
                  {isThisMsgStreaming ? (
                    <span className='inline-flex items-center gap-1 py-0.5'>
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]' />
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]' />
                      <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-current' />
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>

                {!isThisMsgStreaming &&
                  msg.role === 'assistant' &&
                  msg.metadata?.type === 'proposal' &&
                  msg.metadata?.proposal && (
                    <div className='animate-slide-up-fade w-full max-w-[85%] mt-1.5'>
                      <ProposalCard
                        proposal={msg.metadata.proposal}
                        onConfirm={handleProposalConfirm}
                      />
                    </div>
                  )}
              </div>
            );
          })}
          <ScrollIntoView dependency={messages.length} />
        </MessageScrollerContent>
      </MessageScrollerViewport>

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
  );
}
