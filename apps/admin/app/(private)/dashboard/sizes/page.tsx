'use client';

import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  SizesSearchContainer,
  SizesTable,
  SizeStatsGrid,
} from '@/components/pages/sizes';
import { useGetAllSizes } from '@/hooks';
import { CreateSizeForm } from '@/components/forms';
import { generateQueryString } from '@repo/ui/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertModal, Button, PaginationContainer } from '@repo/ui';

export default function SizesPage() {
  const [addSizeModalOpen, setAddSizeModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllSizesMutationData, fetchAllSizesMutation } =
    useGetAllSizes(queryString);

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  useEffect(() => {
    router.replace(queryString, { scroll: false });
  }, [queryString, router]);

  const totalSizes = fetchAllSizesMutationData?.data?.meta?.total || 0;
  const currentCount = fetchAllSizesMutationData?.data?.data?.length || 0;
  const currentPage = fetchAllSizesMutationData?.data?.meta?.currentPage || 1;

  return (
    <div className='space-y-6 w-full md:w-5/6 lg:w-3/6 mx-auto px-4 py-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='space-y-1'>
          <h1 className='text-xl md:text-2xl font-bold tracking-tight text-foreground'>
            Sizes
          </h1>
          <p className='text-xs text-muted-foreground hidden sm:block'>
            Configure dimensional variations and sizing scales for product
            inventory options.
          </p>
        </div>
        <Button onClick={() => setAddSizeModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Size
        </Button>
      </div>

      <SizeStatsGrid
        totalSizes={totalSizes}
        currentCount={currentCount}
        currentPage={currentPage}
      />

      <SizesSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <SizesTable
        data={fetchAllSizesMutationData?.data}
        loading={fetchAllSizesMutation.isLoading}
      />

      <PaginationContainer
        meta={fetchAllSizesMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addSizeModalOpen}
        setIsOpen={setAddSizeModalOpen}
        title='Size Attributes'
        description='Define dimensional variations for product inventory management tokens.'
      >
        <CreateSizeForm setIsOpen={setAddSizeModalOpen} />
      </AlertModal>
    </div>
  );
}
