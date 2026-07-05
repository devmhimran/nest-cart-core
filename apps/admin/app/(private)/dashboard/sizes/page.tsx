'use client';

import { Plus } from 'lucide-react';
import { useGetAllSizes } from '@/hooks';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CreateSizeForm } from '@/components/forms';
import { Button, PaginationContainer } from '@repo/ui';
import { generateQueryString } from '@repo/ui/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import AlertModal from '@repo/ui/components/shared/alert-modal';
import { SizesSearchContainer, SizesTable } from '@/components/pages/sizes';

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

  return (
    <div className='space-y-6 w-full md:w-5/6 lg:w-3/6 mx-auto '>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-2xl font-bold'>Sizes</h1>
        <Button onClick={() => setAddSizeModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Sizes
        </Button>
      </div>
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
        title='Create new size'
      >
        <CreateSizeForm setIsOpen={setAddSizeModalOpen} />
      </AlertModal>
    </div>
  );
}
