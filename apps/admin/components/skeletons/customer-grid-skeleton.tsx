import { Card, CardContent, Skeleton } from '@repo/ui';

export function CustomerGridSkeleton() {
  return (
    <Card className='w-full space-y-4 p-4 md:p-5'>
      <CardContent className='p-0 border-none'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='rounded-xl border border-muted-foreground/10 p-4 space-y-4'
            >
              <div className='flex items-center space-x-3'>
                <Skeleton className='h-10 w-10 rounded-full' />
                <div className='space-y-2 flex-1'>
                  <Skeleton className='h-4 w-[70%]' />
                  <Skeleton className='h-3 w-[40%]' />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='hidden lg:block rounded-xl p-1'>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <Skeleton className='h-8 w-8 rounded-full' />
                <Skeleton className='h-4 flex-1' />
                <Skeleton className='h-4 w-50' />
                <Skeleton className='h-4 w-50' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
