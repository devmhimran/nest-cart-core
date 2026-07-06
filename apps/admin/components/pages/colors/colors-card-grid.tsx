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
import { Meta } from '@/types';
import { ColorType } from '@/types/color';
import { ColorsSkeleton } from '@/components/skeletons';
import { Check, Copy, Ellipsis, SquarePen, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/shared';

interface ColorGridCardProps {
  data?: {
    data: ColorType[];
    meta: Meta;
  };
  loading: boolean;
  copiedText: string | null;
  onCopy: (text: string) => void;
  onEdit: (color: ColorType) => void;
  onDelete: (color: ColorType) => void;
}

export function ColorCardGrid({
  data,
  loading,
  copiedText,
  onCopy,
  onEdit,
  onDelete,
}: ColorGridCardProps) {
  if (loading) return <ColorsSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No colors found.' />;
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
      {data.data.map((color, index) => {
        const serialNumber =
          (data.meta.currentPage - 1) * data.meta.perPage + index + 1;

        return (
          <div
            key={color.id}
            className='group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card 
            text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-foreground/10'
          >
            <div
              style={{ backgroundColor: color.hex }}
              className='relative h-28 w-full border-b bg-muted/20 transition-transform duration-300'
            >
              <span
                className='absolute top-2 left-2 select-none bg-black/40 backdrop-blur-md text-[10px] 
              font-mono text-white px-2 py-0.5 rounded-full border border-white/10 shadow-sm'
              >
                #{serialNumber}
              </span>

              <div className='absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200'>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant='secondary'
                        size='icon'
                        className='h-7 w-7 bg-background/90 hover:bg-background shadow-sm rounded-md'
                      >
                        <Ellipsis className='w-4 h-4' />
                      </Button>
                    }
                  />

                  <DropdownMenuContent align='end'>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className='text-xs'>
                        Options
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(color)}>
                        <SquarePen className='w-4 h-4 mr-2' />
                        <span className='text-sm'>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='text-destructive focus:bg-destructive/10 focus:text-destructive'
                        onClick={() => onDelete(color)}
                      >
                        <Trash2 className='w-4 h-4 mr-2' />
                        <span className='text-sm'>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className='p-3.5 flex items-center justify-between gap-2 bg-card'>
              <div className='space-y-0.5 min-w-0'>
                <h3 className='text-sm font-semibold tracking-tight text-foreground truncate capitalize'>
                  {color.name}
                </h3>

                <button
                  type='button'
                  onClick={() => onCopy(color.hex)}
                  className='flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group/btn cursor-pointer'
                  title='Click to copy hex code'
                >
                  <span className='uppercase'>{color.hex}</span>
                  {copiedText === color.hex ? (
                    <Check className='w-3 h-3 text-green-500 transition-all scale-110' />
                  ) : (
                    <Copy className='w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 text-muted-foreground/70' />
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
