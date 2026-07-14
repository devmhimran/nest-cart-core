'use client';

import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  AlertModal,
  Button,
  ConfirmModal,
  PaginationContainer,
} from '@repo/ui';
import { UsersType } from '@/types/users';
import { useGetAllUsers, useUsers } from '@/hooks';
import { CreateUserForm, UpdateUserForm } from '@/components/forms';
import { generateQueryString, getErrorMessage } from '@repo/ui/lib/utils';
import { UsersGrid, UsersSearchContainer } from '@/components/pages/users';

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { deleteUserAsync } = useUsers();

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    role: searchParams.get('role') || '',
  });
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const queryString = generateQueryString(params);
  const { fetchAllUsersMutationData, fetchAllUsersMutation } =
    useGetAllUsers(queryString);

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

  const handleEditIntent = (user: UsersType) => {
    setSelectedUser(user);
    setUpdateModalOpen(true);
  };

  const handleDeleteIntent = (user: UsersType) => {
    setSelectedUser(user);
    setConfirmModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoadingDelete(true);

    toast.promise(deleteUserAsync(selectedUser.id), {
      loading: 'Deleting user...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModalOpen(false);
        return 'User deleted successfully';
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
            Users
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage users and their permissions.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create User
        </Button>
      </div>

      <UsersSearchContainer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setParams={setParams}
        debounced={debounced}
      />

      <UsersGrid
        data={fetchAllUsersMutationData?.data}
        loading={fetchAllUsersMutation?.isLoading}
        onEdit={handleEditIntent}
        onDelete={handleDeleteIntent}
      />

      <PaginationContainer
        meta={fetchAllUsersMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <AlertModal
        isOpen={addModalOpen}
        setIsOpen={setAddModalOpen}
        title='Create User'
        description='Define a new user with specific permissions.'
      >
        <CreateUserForm setIsOpen={setAddModalOpen} />
      </AlertModal>

      <AlertModal
        isOpen={updateModalOpen}
        setIsOpen={setUpdateModalOpen}
        title='Update User'
        description='Update the details of this user.'
      >
        <UpdateUserForm data={selectedUser} setIsOpen={setUpdateModalOpen} />
      </AlertModal>

      <ConfirmModal
        title={`Are you sure you want to delete ${selectedUser?.name || 'this user'}?`}
        isOpen={confirmModalOpen}
        setIsOpen={setConfirmModalOpen}
        loading={loadingDelete}
        onClick={handleDeleteUser}
      />
    </div>
  );
}
