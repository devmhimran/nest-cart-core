'use client';

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
import { Meta, CategoryType } from '@/types';
import { CategoriesGridSkeleton } from '@/components/skeletons';
import {
  Ellipsis,
  SquarePen,
  Trash2,
  FolderTree,
  ShoppingBag,
  Folder,
} from 'lucide-react';
import { EmptyState } from '@/components/shared';

interface CategoryGridCardProps {
  data?: {
    data: CategoryType[];
    meta: Meta;
  };
  loading: boolean;
  onEdit: (category: CategoryType) => void;
  onDelete: (category: CategoryType) => void;
}

export function CategoriesCardGrid({
  data,
  loading,
  onEdit,
  onDelete,
}: CategoryGridCardProps) {
  if (loading) return <CategoriesGridSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No categories found.' />;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {data.data.map((category) => (
        <div
          key={category.id}
          className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card 
          text-card-foreground transition-all duration-200 hover:shadow-sm hover:border-border-hover'
        >
          <div className='relative h-20 w-full overflow-hidden bg-muted/20 border-b border-border/40'>
            {category.image ? (
              <img
                src={category.image.fileUrl}
                alt={category.name}
                loading='lazy'
                decoding='async'
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]'
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400?text=No+Image';
                }}
              />
            ) : (
              <div className='flex items-center h-full w-full px-4 bg-linear-to-r from-muted/30 to-transparent select-none'>
                <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border/60 shadow-sm'>
                  <Folder className='w-4 h-4 text-muted-foreground/80 stroke-[1.5]' />
                </div>
              </div>
            )}

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
                      onClick={() => onEdit(category)}
                      className='cursor-pointer'
                    >
                      <SquarePen className='w-3.5 h-3.5 mr-2 text-muted-foreground' />
                      <span className='text-sm'>Edit details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer'
                      onClick={() => onDelete(category)}
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
                {category.name}
              </h3>
              <p className='text-xs text-muted-foreground/60 truncate font-mono'>
                /{category.slug}
              </p>
            </div>

            <div className='flex items-center gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground font-normal'>
              <div className='flex items-center gap-1.5'>
                <FolderTree className='w-3.5 h-3.5 text-muted-foreground/50 stroke-[1.5]' />
                <span>
                  <strong className='font-medium text-foreground'>
                    {category._count?.subCategories || 0}
                  </strong>{' '}
                  subs
                </span>
              </div>
              <div className='inline-block w-1 h-1 rounded-full bg-border/80' />
              <div className='flex items-center gap-1.5'>
                <ShoppingBag className='w-3.5 h-3.5 text-muted-foreground/50 stroke-[1.5]' />
                <span>
                  <strong className='font-medium text-foreground'>
                    {category._count?.products || 0}
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
