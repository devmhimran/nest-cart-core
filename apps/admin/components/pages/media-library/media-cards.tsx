import { MediaType } from '@/types';
import { MediaCard } from './media-card';
import { AttachmentGroup } from '@repo/ui';
import { MediaGridSkeleton } from '@/components/skeletons';

interface MediaCardsProps {
  mediaList: MediaType[];
  isLoading?: boolean;
}

export function MediaCards({ mediaList, isLoading }: MediaCardsProps) {
  if (isLoading) {
    return (
      <div className='mx-auto w-full'>
        <AttachmentGroup className='grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-12 gap-4 w-full'>
          {Array.from({ length: 12 }).map((_, index) => (
            <MediaGridSkeleton key={`skeleton-${index}`} />
          ))}
        </AttachmentGroup>
      </div>
    );
  }

  if (mediaList.length === 0) {
    return (
      <div className='text-center py-12 text-sm text-muted-foreground'>
        No media files found.
      </div>
    );
  }

  return (
    <div className='mx-auto w-full'>
      <AttachmentGroup className='flex flex-wrap lg:justify-start md:justify-center gap-4 w-full'>
        {mediaList.map((media) => (
          <MediaCard media={media} key={media.id} />
        ))}
      </AttachmentGroup>
    </div>
  );
}
