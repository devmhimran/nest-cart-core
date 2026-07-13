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
  ColorCardGrid,
  ColorSearchContainer,
  ColorsStatsGrid,
} from '@/components/pages/colors';
import { ColorType } from '@/types';
import { handleCopy } from '@/lib/utils';
import { useColors, useGetAllColors } from '@/hooks';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';
import { CreateColorForm, UpdateColorForm } from '@/components/forms';

export default function ColorsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addColorModalOpen, setAddColorModalOpen] = useState(false);
  const [updateColorModalOpen, setUpdateColorModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { deleteColorAsync } = useColors();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllColorsMutationData, fetchAllColorsMutation } =
    useGetAllColors(queryString);

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

  const totalColors = fetchAllColorsMutationData?.data?.meta?.total || 0;
  const currentCount = fetchAllColorsMutationData?.data?.data?.length || 0;
  const currentPage = fetchAllColorsMutationData?.data?.meta?.currentPage || 1;

  const handleEditIntent = (color: ColorType) => {
    setSelectedColor(color);
    setUpdateColorModalOpen(true);
  };

  const handleDeleteColor = async () => {
    if (!selectedColor) return;
    setLoadingDelete(true);

    toast.promise(deleteColorAsync(selectedColor.id), {
      loading: 'Deleting color...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModalOpen(false);
        return 'Successfully color deleted';
      },
      error: (err) => {
        setLoadingDelete(false);
        return getErrorMessage(err);
      },
    });
  };

  const onCopy = (text: string) => {
    handleCopy(text, setCopiedText);
  };

  return (
    <div className='space-y-6 w-full md:w-5/6 lg:w-4/5 mx-auto px-4 py-6'>
      <div className='flex items-center justify-between gap-4 border-b pb-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Colors
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage and maintain global color definitions for your component
            library.
          </p>
        </div>
        <Button onClick={() => setAddColorModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Color
        </Button>
      </div>

      <ColorsStatsGrid
        totalColors={totalColors}
        currentCount={currentCount}
        currentPage={currentPage}
        loading={fetchAllColorsMutation.isLoading}
      />

      <ColorSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <ColorCardGrid
        data={fetchAllColorsMutationData?.data}
        loading={fetchAllColorsMutation.isLoading}
        copiedText={copiedText}
        onCopy={onCopy}
        onEdit={handleEditIntent}
        onDelete={handleDeleteColor}
      />

      <PaginationContainer
        meta={fetchAllColorsMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addColorModalOpen}
        setIsOpen={setAddColorModalOpen}
        title='Create new color'
        description='Add new colors to define colors inside your global design system.'
      >
        <CreateColorForm setIsOpen={setAddColorModalOpen} />
      </AlertModal>

      <AlertModal
        isOpen={updateColorModalOpen}
        setIsOpen={setUpdateColorModalOpen}
        title='Update color'
      >
        <UpdateColorForm
          data={selectedColor}
          setIsOpen={setUpdateColorModalOpen}
        />
      </AlertModal>

      <ConfirmModal
        title={`Are you sure you want to delete ${selectedColor?.name || 'this color'}?`}
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        loading={loadingDelete}
        onClick={handleDeleteColor}
      />
    </div>
  );
}
