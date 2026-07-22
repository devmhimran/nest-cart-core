'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  CustomerGrid,
  CustomersSearchContainer,
} from '@/components/pages/customers';
import { CustomersType } from '@/types';
import { useCustomer, useGetAllCustomer } from '@/hooks';
import { ConfirmModal, PaginationContainer } from '@repo/ui';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [openBannedModal, setOpenBannedModal] = useState(false);
  const [openInactiveModal, setOpenInactiveModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<CustomersType | null>(null);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllCustomersMutationData, fetchAllCustomersMutation } =
    useGetAllCustomer(queryString);

  const {
    bannedCustomerAsync,
    bannedCustomerMutation,
    inactiveCustomerAsync,
    inactiveCustomerMutation,
  } = useCustomer();

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

  const handleBannedIntent = (user: CustomersType) => {
    setSelectedUser(user);
    setOpenBannedModal(true);
  };

  const handleInactiveIntent = (user: CustomersType) => {
    setSelectedUser(user);
    setOpenInactiveModal(true);
  };

  const handleBannedCustomer = () => {
    if (!selectedUser) return;

    toast.promise(bannedCustomerAsync(selectedUser.id), {
      loading: selectedUser.banned
        ? 'Unbanning customer...'
        : 'Banning customer...',
      success: () => {
        setOpenBannedModal(false);
        return 'Customer banned successfully';
      },
      error: (err) => {
        return getErrorMessage(err);
      },
    });
  };
  const handleInactiveCustomer = () => {
    if (!selectedUser) return;

    toast.promise(inactiveCustomerAsync(selectedUser.id), {
      loading: selectedUser.isActive
        ? 'Making customer inactive...'
        : 'Activating customer...',
      success: () => {
        setOpenInactiveModal(false);
        return 'Customer updated successfully';
      },
      error: (err) => {
        return getErrorMessage(err);
      },
    });
  };

  return (
    <div className='space-y-5 w-full md:w-5/6 lg:w-4/5 mx-auto px-4 py-6'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Customers
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage customers and their permissions.
          </p>
        </div>
      </div>
      <CustomersSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />
      <CustomerGrid
        data={fetchAllCustomersMutationData?.data}
        loading={fetchAllCustomersMutation.isLoading}
        onBanned={handleBannedIntent}
        onInactive={handleInactiveIntent}
      />

      <PaginationContainer
        meta={fetchAllCustomersMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <ConfirmModal
        title={`Are you sure you want to ban ${selectedUser?.name || 'this user'}?`}
        isOpen={openBannedModal}
        setIsOpen={setOpenBannedModal}
        loading={bannedCustomerMutation.isPending}
        onClick={handleBannedCustomer}
      />
      <ConfirmModal
        title={`Are you sure you want to make ${selectedUser?.name || 'this user'} inactive?`}
        isOpen={openInactiveModal}
        setIsOpen={setOpenInactiveModal}
        loading={inactiveCustomerMutation.isPending}
        onClick={handleInactiveCustomer}
      />
    </div>
  );
}
