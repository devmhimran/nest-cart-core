import { Card, CardContent, Skeleton } from '@repo/ui';
import { Layers, Palette, Sliders } from 'lucide-react';

interface ColorsStatsGridProps {
  totalColors: number;
  currentCount: number;
  currentPage: number;
  loading: boolean;
}

export function ColorsStatsGrid({
  totalColors,
  currentCount,
  currentPage,
  loading,
}: ColorsStatsGridProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      <Card className='bg-card/50 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground tracking-wider uppercase'>
              Total Colors
            </p>
            <p className='text-2xl font-bold font-mono text-foreground'>
              {loading ? <Skeleton className='h-8 w-6' /> : totalColors}
            </p>
          </div>
          <div className='p-2.5 bg-primary/10 rounded-lg text-primary'>
            <Palette className='w-5 h-5' />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-card/50 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-4 flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-xs font-medium text-muted-foreground tracking-wider uppercase'>
              Viewing on Page
            </p>
            <p className='text-2xl font-bold font-mono text-foreground'>
              {loading ? <Skeleton className='h-8 w-6' /> : currentCount}
            </p>
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
            <Sliders className='w-5 h-5' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
