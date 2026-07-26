import { useAiChatOptions } from '@/hooks/use-ai-chat';
import { formatRelativeTime } from '@/lib/utils';
import { AiChatConversation } from '@/types';
import { Button, ConfirmModal } from '@repo/ui';
import { getErrorMessage } from '@repo/ui/lib/utils';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export interface ChatHistoryCardProps {
  chat: AiChatConversation;
  isSelected?: boolean;
  onSelect?: (id: string | number) => void;
  onDeleteSelected?: () => void;
  formatRelativeTime?: (date?: string | Date) => string;
}

export function ChatHistoryCard({
  chat,
  isSelected = false,
  onSelect,
  onDeleteSelected,
}: ChatHistoryCardProps) {
  const [conversation, setConversation] = useState<AiChatConversation | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState(false);
  const { deleteConversationMutation, deleteConversationMutationAsync } =
    useAiChatOptions();

  const count =
    typeof chat._count === 'number'
      ? chat._count
      : (chat._count?.messages ?? 0);

  const timeString = formatRelativeTime(chat.lastMessageAt || chat.updatedAt);

  const handleDeleteConversationIntent = (
    e: React.MouseEvent,
    value: AiChatConversation,
  ) => {
    e.stopPropagation();
    setConfirmModal(true);
    setConversation(value);
  };

  const handleDeleteConversation = async () => {
    if (!conversation) return;

    toast.promise(deleteConversationMutationAsync(conversation.id), {
      loading: 'Deleting conversation...',
      success: () => {
        setConfirmModal(false);
        if (isSelected) {
          onDeleteSelected?.();
        }
        return 'Successfully conversation deleted';
      },
      error: (err) => {
        return getErrorMessage(err);
      },
    });
  };

  return (
    <div
      onClick={() => onSelect?.(chat.id)}
      className={`group relative flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-all duration-150 cursor-pointer text-xs ${
        isSelected
          ? 'bg-accent/80 font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      <div className='flex items-center gap-2 min-w-0 flex-1'>
        <MessageSquare
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${
            isSelected
              ? 'text-primary'
              : 'text-muted-foreground/70 group-hover:text-foreground'
          }`}
        />

        <div className='flex items-baseline gap-2 min-w-0 flex-1'>
          <span className='truncate text-[13px] leading-tight text-foreground/90 font-normal'>
            {chat.title || 'Untitled Conversation'}
          </span>

          <span className='shrink-0 text-[10px] text-muted-foreground/60 font-normal'>
            {timeString}
            {count > 0 && ` • ${count}`}
          </span>
        </div>
      </div>

      <Button
        variant='ghost'
        size='icon-sm'
        className='h-7 w-7 p-0'
        onClick={(e) => handleDeleteConversationIntent(e, chat)}
      >
        <Trash2 className='h-3.5 w-3.5 text-red-600' />
      </Button>
      <ConfirmModal
        title='This action cannot be undone. This will permanently delete your conversation'
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={deleteConversationMutation.isPending}
        onClick={handleDeleteConversation}
      />
    </div>
  );
}
