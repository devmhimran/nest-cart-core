import { Card, CardContent, Skeleton } from '@repo/ui';

export function SubCategoriesGridSkeleton() {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {skeletonCards.map((_, index) => (
        <Card
          key={index}
          className='relative flex flex-col justify-between overflow-hidden rounded-xl bg-card pt-0'
        >
          <Skeleton className='h-11 w-full bg-muted/60 relative' />
          <CardContent className='p-4 space-y-3 bg-card'>
            <div className='space-y-2 w-full'>
              <Skeleton className='h-5 bg-muted/70 rounded w-2/3' />
              <Skeleton className='h-4 bg-muted/40 rounded w-1/2' />
            </div>
            <div className='flex gap-2 pt-2 border-t border-border'>
              <Skeleton className='h-6 bg-muted/50 rounded-full w-20' />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
