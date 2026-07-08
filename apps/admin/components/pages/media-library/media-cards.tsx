import { MediaType } from '@/types';
import { MediaCard } from './media-card';
import { AttachmentGroup } from '@repo/ui';

export function MediaCards({ mediaList }: { mediaList: MediaType[] }) {
  return (
    <div className='mx-auto w-full py-6'>
      <AttachmentGroup className='grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-12 gap-4 w-full'>
        {mediaList.map((media) => (
          <MediaCard media={media} key={media.id} />
        ))}
      </AttachmentGroup>
    </div>
  );
}
