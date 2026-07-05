import { Button } from '@repo/ui';
import { Dispatch, SetStateAction } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ParamsProps {
  page: string;
  [key: string]: any;
}

interface PaginationMeta {
  total: number;
  lastPage: number;
}

interface PaginationContainerProps {
  meta?: PaginationMeta;
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<any>> | ((value: any) => void);
}

export function PaginationContainer({
  meta,
  params,
  setParams,
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
        >
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>

        <span className='text-sm text-muted-foreground px-2'>
          Page {currentPage} of {lastPage}
        </span>

        <Button
          variant='outline'
          size='sm'
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
