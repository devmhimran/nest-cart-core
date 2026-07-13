'use client';

import { Search, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@repo/ui';

interface ParamsProps {
  search: string;
  page: string;
}

interface ColorSearchContainerProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<ParamsProps>>;
  debounced: (value: string) => void;
}

export function ColorSearchContainer({
  searchQuery,
  setSearchQuery,
  params,
  setParams,
  debounced,
}: ColorSearchContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by name'
              value={searchQuery}
              onChange={(e) => {
                debounced(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className='pl-8'
            />
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          {params.search && (
            <Badge variant='outline'>
              {params.search}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    search: '',
                  }));
                  setSearchQuery('');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
