import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/ui';
import { MessageCircleDashedIcon } from 'lucide-react';

export function ChatContainerEmptyState() {
  return (
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
  );
}
