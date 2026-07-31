import { BaseEntityItem } from '@/types';
import { Ticket, Calendar, Percent } from 'lucide-react';

interface PromoProposalCardProps {
  items: BaseEntityItem[];
}

export function PromoProposalCard({ items }: PromoProposalCardProps) {
  return (
    <div className='space-y-3'>
      {items.map((promo, idx) => (
        <div
          key={idx}
          className='rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <Ticket className='h-4 w-4 text-primary' />
              <span className='font-mono font-bold text-sm text-primary tracking-wider'>
                {promo.code}
              </span>
            </div>
            <span className='inline-flex items-center text-xs font-semibold text-foreground bg-background px-2 py-0.5 rounded border'>
              <Percent className='h-3 w-3 mr-1 text-emerald-500' />
              {promo.amount} OFF
            </span>
          </div>

          <p className='text-xs font-medium text-foreground'>{promo.title}</p>

          <div className='flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>{promo.startDate?.split('T')[0] || 'Today'}</span>
            </div>
            <span>→</span>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span>{promo.endDate?.split('T')[0] || '+30 Days'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
