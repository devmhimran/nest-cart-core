import { BaseEntityItem, ProductVariantEntity } from '@/types';
import { Tag, Layers } from 'lucide-react';

interface ProductProposalCardProps {
  items: BaseEntityItem[];
}

export function ProductProposalCard({ items }: ProductProposalCardProps) {
  return (
    <div className='space-y-3 divide-y divide-border/40'>
      {items.map((product, idx) => (
        <div key={idx} className={idx > 0 ? 'pt-3 space-y-2' : 'space-y-2'}>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h4 className='text-xs font-semibold text-foreground'>
                {product.title}
              </h4>
              <p className='font-mono text-[10px] text-muted-foreground'>
                {product.slug}
              </p>
            </div>
            {product.basePrice !== undefined && (
              <span className='inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20'>
                ${Number(product.basePrice).toFixed(2)}
              </span>
            )}
          </div>

          {product.description && (
            <p className='text-[11px] text-muted-foreground line-clamp-2 italic'>
              &quot;{product.description}&quot;
            </p>
          )}

          <div className='grid grid-cols-2 gap-2 pt-1 text-[11px]'>
            {product.categoryId && (
              <div className='flex items-center gap-1 text-muted-foreground'>
                <Tag className='h-3 w-3 text-primary' />
                <span>
                  Cat ID:{' '}
                  <strong className='text-foreground'>
                    {product.categoryId}
                  </strong>
                </span>
              </div>
            )}
            {product.subCategoryId && (
              <div className='flex items-center gap-1 text-muted-foreground'>
                <Layers className='h-3 w-3 text-primary' />
                <span>
                  SubCat ID:{' '}
                  <strong className='text-foreground'>
                    {product.subCategoryId}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className='mt-2 rounded-md bg-muted/40 p-2 text-[10px] space-y-1'>
              <span className='font-semibold text-foreground/80 block'>
                Variants ({product.variants.length}):
              </span>
              <div className='flex flex-wrap gap-1'>
                {product.variants.map(
                  (v: ProductVariantEntity, vIdx: number) => (
                    <span
                      key={vIdx}
                      className='bg-background border rounded px-1.5 py-0.5 font-mono'
                    >
                      Color #{v.colorId || 'N/A'} • Size #{v.sizeId || 'N/A'} •
                      ${v.price}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
