import { BaseEntityItem } from '@/types';
import { FolderTree } from 'lucide-react';

interface CategoryProposalCardProps {
  items: BaseEntityItem[];
}

export function CategoryProposalCard({ items }: CategoryProposalCardProps) {
  return (
    <div className='space-y-2'>
      {items.map((cat, idx) => (
        <div
          key={idx}
          className='flex items-center justify-between p-2.5 rounded-lg border bg-muted/20'
        >
          <div className='flex items-center gap-2'>
            <FolderTree className='h-4 w-4 text-primary' />
            <div>
              <p className='text-xs font-semibold text-foreground'>
                {cat.name}
              </p>
              <p className='font-mono text-[10px] text-muted-foreground'>
                {cat.slug}
              </p>
            </div>
          </div>
          {cat.categoryId && (
            <span className='text-[10px] font-mono bg-background border px-1.5 py-0.5 rounded'>
              Parent ID: {cat.categoryId}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
