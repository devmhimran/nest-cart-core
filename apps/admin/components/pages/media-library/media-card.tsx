'use client';

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Modal,
  ConfirmModal,
} from '@repo/ui';
import { toast } from 'sonner';
import { useState } from 'react';
import { useMedia } from '@/hooks';
import { MediaType } from '@/types';
import { MediaDetails } from './media-details';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface MediaCardProps {
  media: MediaType;
}

export function MediaCard({ media }: MediaCardProps) {
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<MediaType | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const { deleteMediaAsync } = useMedia();

  const handleViewDetails = () => {
    setMediaDetails(media);
    setOpenViewDetails(true);
  };

  const handleDelete = () => {
    setIsPending(true);
    if (!media.id) return;
    toast.promise(deleteMediaAsync(media.id), {
      loading: 'Deleting media...',
      success: () => {
        setOpenDeleteConfirm(false);
        setIsPending(false);
        return 'Successfully media deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete media'
        );
      },
    });
  };

  return (
    <Attachment
      key={media.id}
      orientation='vertical'
      className='relative group'
    >
      <div className='absolute top-2 right-2 z-10'>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity border'
                aria-label='Media actions'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            }
          />

          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem
              onClick={handleViewDetails}
              className='cursor-pointer gap-2'
            >
              <Eye className='h-4 w-4 text-muted-foreground' />
              <span>View details</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setMediaDetails(media);
                setOpenDeleteConfirm(true);
              }}
              className='cursor-pointer text-destructive focus:text-destructive gap-2'
            >
              <Trash2 className='h-4 w-4' />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AttachmentMedia variant='image'>
        <img
          src={media.fileUrl}
          alt={media.fileAlt || media.fileName}
          loading='lazy'
          decoding='async'
          className='object-cover h-full w-full'
        />
      </AttachmentMedia>

      <AttachmentContent>
        <AttachmentTitle className='truncate'>
          {media.title || media.fileName}
        </AttachmentTitle>
        <AttachmentDescription>
          {media.fileType.toUpperCase()} · {formatBytes(media.fileSize)}
        </AttachmentDescription>
      </AttachmentContent>

      <Modal
        isOpen={openViewDetails}
        setIsOpen={setOpenViewDetails}
        title={`Media Details`}
      >
        <MediaDetails media={mediaDetails} />
      </Modal>

      <ConfirmModal
        title={`Are you sure you want to delete ${media?.fileName || 'this media file'}?`}
        isOpen={openDeleteConfirm}
        setIsOpen={setOpenDeleteConfirm}
        loading={isPending}
        onClick={handleDelete}
      />
    </Attachment>
  );
}
