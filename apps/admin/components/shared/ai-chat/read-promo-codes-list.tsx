import { Ticket } from 'lucide-react';

import { Badge } from '@repo/ui';
import { BaseEntityItem } from '@/types';

interface ReadPromoCodesListProps {
  items: BaseEntityItem[];
}

export function ReadPromoCodesList({ items }: ReadPromoCodesListProps) {
  return (
    <div className='space-y-2'>
      {items.map((promo, idx) => (
        <div
          key={promo.id || idx}
          className='p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between'
        >
          <div className='space-y-0.5'>
            <div className='flex items-center gap-2'>
              <Ticket className='w-3.5 h-3.5 text-primary' />
              <span className='font-mono font-bold text-xs tracking-wide'>
                {promo.code}
              </span>
              <Badge
                variant='outline'
                className='text-[9px] h-4 border-primary/30 text-primary'
              >
                -${promo.amount}
              </Badge>
            </div>
            <p className='text-[11px] font-medium text-foreground'>
              {promo.title}
            </p>
          </div>
          {promo.id && (
            <Badge variant='outline' className='text-[9px] font-mono'>
              #{promo.id}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}
