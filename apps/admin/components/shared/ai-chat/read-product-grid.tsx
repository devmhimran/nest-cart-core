import { Badge } from '@repo/ui';
import { BaseEntityItem } from '@/types';

interface ReactProductGridProps {
  items: BaseEntityItem[];
}

export function ReadProductsGrid({ items }: ReactProductGridProps) {
  return (
    <div className='grid gap-2 grid-cols-1 sm:grid-cols-2'>
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className='p-2.5 rounded-lg border border-border/60 bg-card/60 flex flex-col justify-between gap-2'
        >
          <div className='space-y-1'>
            <div className='flex items-start justify-between gap-2'>
              <span className='text-xs font-bold line-clamp-1'>
                {item.title}
              </span>
              <span className='text-xs font-mono font-bold text-primary shrink-0'>
                ${item.basePrice}
              </span>
            </div>
            {item.slug && (
              <p className='text-[10px] font-mono text-muted-foreground'>
                /{item.slug}
              </p>
            )}
            {item.shortDescription && (
              <p className='text-[10px] text-muted-foreground line-clamp-2'>
                {item.shortDescription}
              </p>
            )}
          </div>

          <div className='flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/30'>
            {item.id && (
              <Badge variant='outline' className='text-[9px] h-4 font-mono'>
                ID: {item.id}
              </Badge>
            )}
            {item.isActive !== undefined && (
              <Badge
                variant={item.isActive ? 'default' : 'secondary'}
                className='text-[9px] h-4'
              >
                {item.isActive ? 'Active' : 'Draft'}
              </Badge>
            )}
            {item.variants && item.variants.length > 0 && (
              <Badge variant='outline' className='text-[9px] h-4'>
                {item.variants.length} Var
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
