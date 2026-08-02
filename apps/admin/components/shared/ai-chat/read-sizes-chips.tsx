import { Badge } from '@repo/ui';
import { BaseEntityItem } from '@/types';

interface ReadSizesChipsProps {
  items: BaseEntityItem[];
}

export function ReadSizesChips({ items }: ReadSizesChipsProps) {
  return (
    <div className='flex flex-wrap gap-1.5'>
      {items.map((size, idx) => (
        <Badge
          key={size.id || idx}
          variant='secondary'
          className='px-2.5 py-1 text-xs font-mono font-bold uppercase border border-border/40'
        >
          {size.name}{' '}
          {size.id && (
            <span className='text-[9px] font-normal text-muted-foreground ml-1'>
              #{size.id}
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
}
