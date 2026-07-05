import { Skeleton } from '@repo/ui';
import { ChevronsUpDown } from 'lucide-react';

export function UserNavSkeleton() {
  return (
    <div className='border w-full p-2'>
      <div className='flex items-center w-full'>
        <Skeleton className='h-6 w-6 rounded-full mr-2' />
        <div className='flex flex-col items-start gap-1 flex-1 min-w-0'>
          <Skeleton className='h-3 w-24 rounded' />
          <Skeleton className='h-2 w-16 rounded' />
        </div>
        <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-30' />
      </div>
    </div>
  );
}
