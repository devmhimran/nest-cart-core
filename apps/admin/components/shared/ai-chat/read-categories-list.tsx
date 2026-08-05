import { Layers } from 'lucide-react';

import { BaseEntityItem } from '@/types';

interface ReadCategoriesListProps {
  items: BaseEntityItem[];
}

export function ReadCategoriesList({ items }: ReadCategoriesListProps) {
  return (
    <div className='space-y-1.5'>
      {items.map((cat, idx) => (
        <div
          key={cat.id || idx}
          className='group flex items-center justify-between p-2 rounded-lg border border-border/50 bg-card hover:bg-accent/40 transition-colors gap-2'
        >
          {/* Left Block */}
          <div className='flex items-center gap-2.5 min-w-0 flex-1'>
            <div className='flex items-center justify-center w-7 h-7 rounded-md bg-muted text-muted-foreground group-hover:text-foreground shrink-0'>
              <Layers className='w-3.5 h-3.5' />
            </div>

            <div className='flex flex-col min-w-0 flex-1'>
              <span className='text-xs font-semibold text-foreground truncate leading-tight'>
                {cat.name}
              </span>
              <span className='text-[10px] font-mono text-muted-foreground truncate leading-tight'>
                /{cat.slug}
              </span>
            </div>
          </div>

          {/* Right ID Tag */}
          {cat.id && (
            <span className='text-[10px] font-mono text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0'>
              #{cat.id}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
