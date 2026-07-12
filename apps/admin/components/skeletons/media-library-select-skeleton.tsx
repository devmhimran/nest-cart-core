import { AttachmentGroup, Skeleton } from '@repo/ui';

export function MediaLibrarySelectSkeleton() {
  return (
    <AttachmentGroup className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='border rounded-lg p-2 space-y-2'>
          <Skeleton className='h-16 w-full rounded-md' />
          <Skeleton className='h-3 w-3/4' />
          <Skeleton className='h-2 w-1/2' />
        </div>
      ))}
    </AttachmentGroup>
  );
}
