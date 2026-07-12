'use client';

import { CreateCategoryForm } from '@/components/forms';
import { CategoriesSearchContainer } from '@/components/pages/categories';
import { AlertModal, Button } from '@repo/ui';
import { generateQueryString } from '@repo/ui/lib/utils';
import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function CategoriesPage() {
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
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
  // const { fetchAllColorsMutationData, fetchAllColorsMutation } =
  //   useGetAllColors(queryString);

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
    <div className='space-y-6 w-full md:w-5/6 lg:w-4/6 mx-auto px-4 py-6'>
      <div className='flex items-center justify-between border-b pb-4'>
        <div className='space-y-1'>
          <h1 className='text-xl md:text-2xl font-bold tracking-tight text-foreground'>
            Categories
          </h1>
          <p className='text-xs text-muted-foreground hidden sm:block'>
            Configure product categories to organize and classify items for
          </p>
        </div>
        <Button onClick={() => setAddCategoryModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Category
        </Button>
      </div>

      <CategoriesSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <AlertModal
        isOpen={addCategoryModalOpen}
        setIsOpen={setAddCategoryModalOpen}
        title='Category Attributes'
        description='Define category-specific attributes for product organization.'
      >
        <CreateCategoryForm setIsOpen={setAddCategoryModalOpen} />
      </AlertModal>
    </div>
  );
}
