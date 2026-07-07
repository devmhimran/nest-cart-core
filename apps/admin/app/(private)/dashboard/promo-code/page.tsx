'use client';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';
import { Button, ConfirmModal, PaginationContainer } from '@repo/ui';
import AlertModal from '@repo/ui/components/shared/alert-modal';
import { CreatePromoCodeForm, UpdatePromoCodeForm } from '@/components/forms';
import {
  PromoCodeCardGrid,
  PromoCodeSearchContainer,
  PromoCodeStatsGrid,
} from '@/components/pages/promo-code';
import { useGetAllPromoCodes, usePromoCodes } from '@/hooks';
import { PromoCodeType } from '@/types';

export default function PromoCodePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addPromoCodeModalOpen, setAddPromoCodeModalOpen] = useState(false);
  const [updatePromoCodeModalOpen, setUpdatePromoCodeModalOpen] =
    useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] =
    useState<PromoCodeType | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { deletePromoCodeAsync } = usePromoCodes();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllPromoCodesMutationData, fetchAllPromoCodesMutation } =
    useGetAllPromoCodes(queryString);

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

  const totalPromoCodes =
    fetchAllPromoCodesMutationData?.data?.meta?.total || 0;
  const currentCount = fetchAllPromoCodesMutationData?.data?.data?.length || 0;
  const currentPage =
    fetchAllPromoCodesMutationData?.data?.meta?.currentPage || 1;

  const handleEditIntent = (promoCode: PromoCodeType) => {
    setSelectedPromoCode(promoCode);
    setUpdatePromoCodeModalOpen(true);
  };

  const handleDeletePromoCode = async () => {
    if (!selectedPromoCode) return;
    setLoadingDelete(true);

    toast.promise(deletePromoCodeAsync(selectedPromoCode.id), {
      loading: 'Deleting promo code...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModalOpen(false);
        return 'Successfully promo code deleted';
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
            Promo Codes
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage discount codes, titles, values, and validity windows.
          </p>
        </div>
        <Button onClick={() => setAddPromoCodeModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Promo Code
        </Button>
      </div>

      <PromoCodeStatsGrid
        totalPromoCodes={totalPromoCodes}
        currentCount={currentCount}
        currentPage={currentPage}
        loading={fetchAllPromoCodesMutation.isLoading}
      />

      <PromoCodeSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <PromoCodeCardGrid
        data={fetchAllPromoCodesMutationData?.data}
        loading={fetchAllPromoCodesMutation.isLoading}
        onEdit={handleEditIntent}
        onDelete={(promoCode) => {
          setSelectedPromoCode(promoCode);
          setConfirmModalOpen(true);
        }}
      />

      <PaginationContainer
        meta={fetchAllPromoCodesMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addPromoCodeModalOpen}
        setIsOpen={setAddPromoCodeModalOpen}
        title='Create new promo code'
        description='Create a new promo code with its display title, amount, and validity range.'
      >
        <CreatePromoCodeForm setIsOpen={setAddPromoCodeModalOpen} />
      </AlertModal>

      <AlertModal
        isOpen={updatePromoCodeModalOpen}
        setIsOpen={setUpdatePromoCodeModalOpen}
        title='Update promo code'
      >
        <UpdatePromoCodeForm
          data={selectedPromoCode}
          setIsOpen={setUpdatePromoCodeModalOpen}
        />
      </AlertModal>

      <ConfirmModal
        title={`Are you sure you want to delete ${selectedPromoCode?.code || 'this promo code'}?`}
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        loading={loadingDelete}
        onClick={handleDeletePromoCode}
      />
    </div>
  );
}
