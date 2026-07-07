import { Skeleton, Card, CardContent } from '@repo/ui';

export function PromoCodesSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className='overflow-hidden border bg-card shadow-sm'>
          <CardContent className='space-y-4 p-4'>
            <div className='flex items-start justify-between gap-4'>
              <div className='space-y-2 flex-1'>
                <Skeleton className='h-6 w-40' />
                <Skeleton className='h-5 w-20 rounded-full' />
                <Skeleton className='h-4 w-24' />
              </div>
              <Skeleton className='h-8 w-8 rounded-md' />
            </div>

            <Skeleton className='h-12 w-full rounded-xl' />

            <div className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-4 w-16' />
              </div>
              <div className='flex items-center justify-between gap-3'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-32' />
              </div>
              <div className='flex items-center justify-between gap-3'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
