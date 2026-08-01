import { BaseEntityItem } from '@/types';

interface SizeProposalCardProps {
  items: BaseEntityItem[];
}

export function SizeProposalCard({ items }: SizeProposalCardProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((size, idx) => (
        <div
          key={idx}
          className='flex items-center gap-1 px-3 py-1.5 rounded-md border bg-muted/30'
        >
          <span className='text-[10px] text-muted-foreground uppercase'>
            Size:
          </span>
          <span className='text-xs font-bold text-foreground uppercase'>
            {size.name}
          </span>
        </div>
      ))}
    </div>
  );
}
