'use client';

import {
  Ellipsis,
  SquarePen,
  Trash2,
  ShoppingBag,
  ListTree,
} from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Meta, SubCategoryType } from '@/types';
import { EmptyState } from '@/components/shared';
import { SubCategoriesGridSkeleton } from '@/components/skeletons';

interface SubCategoriesGridProps {
  data?: {
    data: SubCategoryType[];
    meta: Meta;
  };
  loading: boolean;
  onEdit: (subCategory: SubCategoryType) => void;
  onDelete: (subCategory: SubCategoryType) => void;
}

export function SubCategoriesGrid({
  data,
  loading,
  onEdit,
  onDelete,
}: SubCategoriesGridProps) {
  if (loading) return <SubCategoriesGridSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No sub categories found.' />;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {data.data.map((subCategory) => (
        <div
          key={subCategory.id}
          className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card 
          text-card-foreground transition-all duration-200 hover:shadow-sm hover:border-border-hover'
        >
          <div className='relative h-20 w-full overflow-hidden bg-linear-to-br from-primary/5 via-primary/2 to-muted/30 border-b border-border/40'>
            <div className='flex items-center h-full w-full px-4'>
              <div className='flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 shadow-sm'>
                <ListTree className='w-4 h-4 text-primary/70 stroke-[1.5]' />
              </div>
              <div className='ml-3 min-w-0 flex-1'>
                <p className='text-[11px] font-semibold text-foreground/80 tracking-tight truncate'>
                  {subCategory.category?.name || 'Uncategorized'}
                </p>
                <p className='text-[10px] text-muted-foreground/50 font-mono truncate mt-px'>
                  {subCategory.category?.slug
                    ? `/ ${subCategory.category.slug}`
                    : ''}
                </p>
              </div>
              {subCategory.category && (
                <span className='shrink-0 self-start mt-1.5 mr-0.5 inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary/70 tracking-wide uppercase'>
                  parent
                </span>
              )}
            </div>

            <div className='absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150'>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 bg-background/90 hover:bg-background shadow-sm rounded-md border border-border/50 backdrop-blur-sm'
                    >
                      <Ellipsis className='w-3.5 h-3.5 text-muted-foreground hover:text-foreground' />
                    </Button>
                  }
                />

                <DropdownMenuContent align='end' className='w-40'>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className='text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-2 py-1.5'>
                      Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onEdit(subCategory)}
                      className='cursor-pointer'
                    >
                      <SquarePen className='w-3.5 h-3.5 mr-2 text-muted-foreground' />
                      <span className='text-sm'>Edit details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer'
                      onClick={() => onDelete(subCategory)}
                    >
                      <Trash2 className='w-3.5 h-3.5 mr-2' />
                      <span className='text-sm'>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className='p-4 flex-1 flex flex-col justify-between space-y-4'>
            <div className='space-y-0.5 min-w-0'>
              <h3 className='text-sm font-medium tracking-tight text-foreground truncate capitalize'>
                {subCategory.name}
              </h3>
              <p className='text-xs text-muted-foreground/60 truncate font-mono'>
                /{subCategory.slug}
              </p>
            </div>

            <div className='flex items-center gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground font-normal'>
              <div className='flex items-center gap-1.5'>
                <ShoppingBag className='w-3.5 h-3.5 text-muted-foreground/50 stroke-[1.5]' />
                <span>
                  <strong className='font-medium text-foreground'>
                    {subCategory._count?.products || 0}
                  </strong>{' '}
                  products
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
