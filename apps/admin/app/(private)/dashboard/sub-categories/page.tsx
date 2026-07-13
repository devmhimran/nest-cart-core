'use client';

import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Button,
  PaginationContainer,
  ConfirmModal,
  AlertModal,
} from '@repo/ui';
import {
  SubCategoriesGrid,
  SubCategoriesSearchContainer,
} from '@/components/pages/sub-categories';
import { SubCategoryType } from '@/types';
import { useSubCategories, useGetAllSubCategories } from '@/hooks';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';
import { CreateSubCategoryForm, UpdateSubCategoryForm } from '@/components/forms';

export default function SubCategoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryType | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { deleteSubCategoryAsync } = useSubCategories();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllSubCategoriesMutationData, fetchAllSubCategoriesMutation } =
    useGetAllSubCategories(queryString);

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

  const handleEditIntent = (subCategory: SubCategoryType) => {
    setSelectedSubCategory(subCategory);
    setUpdateModalOpen(true);
  };

  const handleDeleteIntent = (subCategory: SubCategoryType) => {
    setSelectedSubCategory(subCategory);
    setConfirmModalOpen(true);
  };

  const handleDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;
    setLoadingDelete(true);

    toast.promise(deleteSubCategoryAsync(selectedSubCategory.id), {
      loading: 'Deleting sub category...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModalOpen(false);
        return 'Sub category deleted successfully';
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
            Sub Categories
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage sub categories to organize products within parent categories.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Sub Category
        </Button>
      </div>

      <SubCategoriesSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <SubCategoriesGrid
        data={fetchAllSubCategoriesMutationData?.data}
        loading={fetchAllSubCategoriesMutation.isLoading}
        onEdit={handleEditIntent}
        onDelete={handleDeleteIntent}
      />

      <PaginationContainer
        meta={fetchAllSubCategoriesMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addModalOpen}
        setIsOpen={setAddModalOpen}
        title='Create Sub Category'
        description='Define a new sub category under a parent category.'
      >
        <CreateSubCategoryForm setIsOpen={setAddModalOpen} />
      </AlertModal>

      <AlertModal
        isOpen={updateModalOpen}
        setIsOpen={setUpdateModalOpen}
        title='Update Sub Category'
        description='Update the details of this sub category.'
      >
        <UpdateSubCategoryForm
          data={selectedSubCategory}
          setIsOpen={setUpdateModalOpen}
        />
      </AlertModal>

      <ConfirmModal
        title={`Are you sure you want to delete ${selectedSubCategory?.name || 'this sub category'}?`}
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        loading={loadingDelete}
        onClick={handleDeleteSubCategory}
      />
    </div>
  );
}
