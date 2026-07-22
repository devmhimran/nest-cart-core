'use client';

import { Meta } from '@/types';
import { UsersType } from '@/types/users';
import { EmptyState } from '@/components/shared';
import { UsersSkeleton } from '@/components/skeletons';
import { UsersTable } from './users-table';
import { UsersCards } from './users-cards';

interface UsersGridProps {
  data?: {
    data: UsersType[];
    meta: Meta;
  };
  loading: boolean;
  onEdit: (user: UsersType) => void;
  onDelete: (user: UsersType) => void;
}

export function UsersGrid({ data, loading, onEdit, onDelete }: UsersGridProps) {
  if (loading) return <UsersSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No users found.' />;
  }

  return (
    <>
      <UsersCards
        users={data.data}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <UsersTable
        users={data.data}
        meta={data.meta}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
