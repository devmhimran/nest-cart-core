import { BaseEntityItem } from '@/types';

interface ColorProposalCardProps {
  items: BaseEntityItem[];
}

export function ColorProposalCard({ items }: ColorProposalCardProps) {
  return (
    <div className='grid grid-cols-1 gap-2'>
      {items.map((color, idx) => (
        <div
          key={idx}
          className='flex items-center justify-between p-2.5 rounded-lg border bg-muted/20'
        >
          <div className='flex items-center gap-3'>
            <div
              className='h-7 w-7 rounded-full border border-border shadow-inner'
              style={{ backgroundColor: color.hex || '#808080' }}
            />
            <div>
              <p className='text-xs font-semibold text-foreground'>
                {color.name}
              </p>
              <p className='font-mono text-[10px] text-muted-foreground'>
                {color.hex || '#808080'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
