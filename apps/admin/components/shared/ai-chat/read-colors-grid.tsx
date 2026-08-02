import { BaseEntityItem } from '@/types';

interface ReadColorsGridProps {
  items: BaseEntityItem[];
}

export function ReadColorsGrid({ items }: ReadColorsGridProps) {
  return (
    <div className='grid gap-2 grid-cols-2 sm:grid-cols-3'>
      {items.map((color, idx) => (
        <div
          key={color.id || idx}
          className='p-2 rounded-md border border-border/50 bg-card flex items-center gap-2'
        >
          <div
            className='h-6 w-6 rounded-full border border-black/10 shadow-xs shrink-0'
            style={{ backgroundColor: color.hex || '#808080' }}
          />
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold truncate'>{color.name}</p>
            <p className='text-[9px] font-mono text-muted-foreground uppercase'>
              {color.hex}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
