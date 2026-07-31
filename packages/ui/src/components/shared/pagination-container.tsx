import { Button } from '@repo/ui';
import { Dispatch, SetStateAction } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Meta } from '@repo/ui/types/common';
import { cn } from '@repo/ui/lib/utils';

interface ParamsProps {
  page: string;
  [key: string]: any;
}

interface PaginationContainerProps {
  meta?: Meta;
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<any>> | ((value: any) => void);
  prevBtnClassName?: string;
  nextBtnClassName?: string;
  paginationContainerClassName?: string;
  prevBtn?: boolean;
  nextBtn?: boolean;
}

export function PaginationContainer({
  meta,
  params,
  setParams,
  prevBtnClassName,
  nextBtnClassName,
  paginationContainerClassName,
  prevBtn = true,
  nextBtn = true,
}: PaginationContainerProps) {
  if (!meta || meta.total === 0) return null;

  const currentPage = Number(params.page) || 1;
  const lastPage = meta.lastPage || 1;

  const handlePageChange = (newPage: number) => {
    if (typeof setParams === 'function') {
      setParams((prev: any) => ({
        ...prev,
        page: newPage.toString(),
      }));
    }
  };

  return (
    <div className='flex flex-col items-center justify-center gap-3 py-4 md:flex-row md:justify-end'>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={prevBtnClassName}
        >
          <ChevronLeft className='h-4 w-4' />
          {prevBtn && 'Previous'}
        </Button>

        <span
          className={cn(
            'text-sm text-muted-foreground px-2',
            paginationContainerClassName,
          )}
        >
          Page {currentPage} of {lastPage}
        </span>

        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className={nextBtnClassName}
        >
          {nextBtn && 'Next'}
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
