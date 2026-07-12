import {
  Attachment,
  AttachmentContent,
  AttachmentMedia,
  Skeleton,
} from '@repo/ui';

export function MediaGridSkeleton() {
  return (
    <Attachment orientation='vertical' className='relative'>
      <div className='absolute top-2 right-2 z-10'>
        <Skeleton className='h-6 w-6 rounded-full' />
      </div>

      <AttachmentMedia variant='image'>
        <Skeleton className='h-full w-full' />
      </AttachmentMedia>

      <AttachmentContent className='space-y-2'>
        <Skeleton className='h-4 w-3/4 rounded' />

        <Skeleton className='h-3 w-1/2 rounded' />
      </AttachmentContent>
    </Attachment>
  );
}
