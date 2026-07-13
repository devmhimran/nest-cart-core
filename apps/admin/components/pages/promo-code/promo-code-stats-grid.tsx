import { CalendarRange, Layers, TicketPercent } from 'lucide-react';

import { Card, CardContent, Skeleton } from '@repo/ui';

interface PromoCodeStatsGridProps {
  totalPromoCodes: number;
  currentCount: number;
  currentPage: number;
  loading: boolean;
}

export function PromoCodeStatsGrid({
  totalPromoCodes,
  currentCount,
  currentPage,
  loading,
}: PromoCodeStatsGridProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <Card className='bg-card/50 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground tracking-wider uppercase'>
              Total Promo Codes
            </p>
            <span className='text-2xl font-bold font-mono text-foreground'>
              {loading ? <Skeleton className='h-8 w-6' /> : totalPromoCodes}
            </span>
          </div>
          <div className='p-2.5 bg-primary/10 rounded-lg text-primary'>
            <TicketPercent className='w-5 h-5' />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-card/50 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground tracking-wider uppercase'>
              Viewing on Page
            </p>
            <span className='text-2xl font-bold font-mono text-foreground'>
              {loading ? <Skeleton className='h-8 w-6' /> : currentCount}
            </span>
          </div>
          <div className='p-2.5 bg-amber-500/10 rounded-lg text-amber-500'>
            <Layers className='w-5 h-5' />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-card/50 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground tracking-wider uppercase'>
              Active Index
            </p>
            <div className='text-2xl font-bold font-mono text-foreground flex gap-1'>
              P. {loading ? <Skeleton className='h-8 w-6' /> : currentPage}
            </div>
          </div>
          <div className='p-2.5 bg-emerald-500/10 rounded-lg text-emerald-500'>
            <CalendarRange className='w-5 h-5' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
