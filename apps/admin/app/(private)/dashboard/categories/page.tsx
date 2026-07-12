'use client';

import { Plus } from 'lucide-react';
import { CategoryType } from '@/types';
import { useCategories, useGetAllCategories } from '@/hooks';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  PaginationContainer,
  ConfirmModal,
  AlertModal,
} from '@repo/ui';
import { CreateCategoryForm, UpdateCategoryForm } from '@/components/forms';
import {
  CategoriesCardGrid,
  CategoriesSearchContainer,
} from '@/components/pages/categories';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [updateCategoryModalOpen, setUpdateCategoryModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { deleteCategoryAsync } = useCategories();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllCategoriesMutationData, fetchAllCategoriesMutation } =
    useGetAllCategories(queryString);

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

  const handleEditIntent = (category: CategoryType) => {
    setSelectedCategory(category);
    setUpdateCategoryModalOpen(true);
  };

  const handleDeleteIntent = (category: CategoryType) => {
    setSelectedCategory(category);
    setConfirmModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setLoadingDelete(true);

    toast.promise(deleteCategoryAsync(selectedCategory.id), {
      loading: 'Deleting category...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModalOpen(false);
        return 'Successfully category deleted';
      },
      error: (err) => {
        setLoadingDelete(false);
        return getErrorMessage(err);
      },
    });
  };

  return (
    <div className='space-y-6 w-full md:w-5/6 lg:w-4/5 mx-auto px-4 py-6'>
      <div className='flex items-center justify-between gap-4 border-b pb-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Categories
          </h1>
          <p className='text-xs text-muted-foreground'>
            Configure and manage product categories to organize items in your marketplace.
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

      <CategoriesCardGrid
        data={fetchAllCategoriesMutationData?.data}
        loading={fetchAllCategoriesMutation.isLoading}
        onEdit={handleEditIntent}
        onDelete={handleDeleteIntent}
      />

      <PaginationContainer
        meta={fetchAllCategoriesMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addCategoryModalOpen}
        setIsOpen={setAddCategoryModalOpen}
        title='Create Category'
        description='Define a new product category for layout organization.'
      >
        <CreateCategoryForm setIsOpen={setAddCategoryModalOpen} />
      </AlertModal>

      <AlertModal
        isOpen={updateCategoryModalOpen}
        setIsOpen={setUpdateCategoryModalOpen}
        title='Update Category'
        description='Update descriptive details of the category.'
      >
        <UpdateCategoryForm
          data={selectedCategory}
          setIsOpen={setUpdateCategoryModalOpen}
        />
      </AlertModal>

      <ConfirmModal
        title={`Are you sure you want to delete ${selectedCategory?.name || 'this category'}?`}
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        loading={loadingDelete}
        onClick={handleDeleteCategory}
      />
    </div>
  );
}
