import { Card, CardContent } from '@repo/ui';
import { ArrowUpDown, Layers, Ruler } from 'lucide-react';

interface SizeStatsGridProps {
  totalSizes: number;
  currentCount: number;
  currentPage: number;
}

export function SizeStatsGrid({
  totalSizes,
  currentCount,
  currentPage,
}: SizeStatsGridProps) {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <Card className='bg-card/40 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-3.5 flex items-center justify-between'>
          <div className='space-y-0.5'>
            <p className='text-[10px] font-bold text-muted-foreground tracking-wider uppercase'>
              Total Options
            </p>
            <p className='text-xl font-bold font-mono text-foreground'>
              {totalSizes}
            </p>
          </div>
          <div className='p-2 bg-blue-500/10 rounded-lg text-blue-500 hidden sm:block'>
            <Ruler className='w-4 h-4' />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-card/40 backdrop-blur-sm shadow-sm'>
        <CardContent className='p-3.5 flex items-center justify-between'>
          <div className='space-y-0.5'>
            <p className='text-[10px] font-bold text-muted-foreground tracking-wider uppercase'>
              On This Page
            </p>
            <p className='text-xl font-bold font-mono text-foreground'>
              {currentCount}
            </p>
          </div>
          <div className='p-2 bg-indigo-500/10 rounded-lg text-indigo-500 hidden sm:block'>
            <Layers className='w-4 h-4' />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-card/40 backdrop-blur-sm  shadow-sm'>
        <CardContent className='p-3.5 flex items-center justify-between'>
          <div className='space-y-0.5'>
            <p className='text-[10px] font-bold text-muted-foreground tracking-wider uppercase'>
              Active Index
            </p>
            <p className='text-xl font-bold font-mono text-foreground'>
              P. {currentPage}
            </p>
          </div>
          <div className='p-2 bg-violet-500/10 rounded-lg text-violet-500 hidden sm:block'>
            <ArrowUpDown className='w-4 h-4' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
