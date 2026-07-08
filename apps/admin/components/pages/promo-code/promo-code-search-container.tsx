'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Modal,
} from '@repo/ui';
import { Search, X } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { PromoCodeFilter } from './promo-code-filter';

interface ParamsProps {
  search: string;
  page: string;
  startDate: string;
  endDate: string;
  active: string;
}

interface PromoCodeSearchContainerProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<ParamsProps>>;
  debounced: (value: string) => void;
}

export function PromoCodeSearchContainer({
  searchQuery,
  setSearchQuery,
  params,
  setParams,
  debounced,
}: PromoCodeSearchContainerProps) {
  const [openFilter, setOpenFilter] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex flex-col gap-5 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by code or title'
              value={searchQuery}
              onChange={(e) => {
                debounced(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className='pl-8'
            />
          </div>
          <Button className='w-1/12' onClick={() => setOpenFilter(true)}>
            Filter
          </Button>
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
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
          {params.startDate && (
            <Badge variant='outline'>
              {params.startDate}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    startDate: '',
                  }));
                  setSearchQuery('');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
          {params.endDate && (
            <Badge variant='outline'>
              {params.endDate}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    endDate: '',
                  }));
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
          {params.active && (
            <Badge variant='outline'>
              {params.active !== 'all' ? 'Active' : 'Inactive'}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    active: '',
                  }));
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
      <Modal
        isOpen={openFilter}
        setIsOpen={setOpenFilter}
        title='Filter Promo Codes'
        description='Filter promo codes based on specific criteria.'
      >
        <PromoCodeFilter params={params} setParams={setParams} />
      </Modal>
    </Card>
  );
}
