'use client';

import { Dispatch, SetStateAction } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, XCircle } from 'lucide-react';
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface ParamsProps {
  search: string;
  page: string;
  startDate: string;
  endDate: string;
  active: string;
}

interface PromoCodeFilterProps {
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<ParamsProps>>;
}

const items = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'true', label: 'Active Only' },
  { value: 'false', label: 'Expired Only' },
];

export function PromoCodeFilter({ params, setParams }: PromoCodeFilterProps) {
  const updateParam = (key: keyof ParamsProps, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
      page: '1',
    }));
  };

  const clearFilters = () => {
    setParams((prev) => ({
      ...prev,
      startDate: '',
      endDate: '',
      active: '',
      page: '1',
    }));
  };

  const hasActiveFilters = params.startDate || params.endDate || params.active;

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <label className='text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90'>
          Campaign Status
        </label>
        <Select
          items={items}
          value={params.active}
          onValueChange={(value) => {
            setParams((prev) => ({
              ...prev,
              active: value === 'all' || !value ? '' : value,
              page: '1',
            }));
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <label className='text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90'>
            Valid From
          </label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal bg-background',
                    !params.startDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {params.startDate ? (
                    format(new Date(params.startDate), 'MMM dd, yyyy')
                  ) : (
                    <span>Pick start date</span>
                  )}
                </Button>
              }
            />

            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={
                  params.startDate ? new Date(params.startDate) : undefined
                }
                onSelect={(date) =>
                  updateParam(
                    'startDate',
                    date ? format(date, 'yyyy-MM-dd') : '',
                  )
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className='flex flex-col gap-2'>
          <label className='text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90'>
            Valid Until
          </label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal bg-background',
                    !params.endDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {params.endDate ? (
                    format(new Date(params.endDate), 'MMM dd, yyyy')
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              }
            />

            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={params.endDate ? new Date(params.endDate) : undefined}
                onSelect={(date) =>
                  updateParam('endDate', date ? format(date, 'yyyy-MM-dd') : '')
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Optional Persistent Reset Action Row */}
      {hasActiveFilters && (
        <div className='pt-2 border-t flex justify-end'>
          <Button
            variant='ghost'
            onClick={clearFilters}
            className='text-xs text-destructive hover:bg-destructive/5 hover:text-destructive h-8 gap-1.5'
          >
            <XCircle className='h-3.5 w-3.5' />
            Clear Active Filters
          </Button>
        </div>
      )}
    </div>
  );
}
