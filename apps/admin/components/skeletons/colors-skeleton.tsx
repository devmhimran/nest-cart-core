import { Card, CardContent, Skeleton } from '@repo/ui';

export function ColorsSkeleton() {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {skeletonCards.map((_, index) => (
        <Card
          key={index}
          className='relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-sm pt-0'
        >
          <Skeleton className='h-16 w-full bg-muted/60 relative' />
          <CardContent className='p-3.5 flex items-center justify-between gap-2 bg-card'>
            <Skeleton className='space-y-2 min-w-0 w-full'>
              <Skeleton className='h-4 bg-muted/70 rounded w-1/2' />
              <Skeleton className='h-3 bg-muted/40 rounded w-1/3' />
            </Skeleton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
