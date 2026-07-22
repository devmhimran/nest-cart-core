import { CustomersType, Meta } from '@/types';
import { EmptyState } from '@/components/shared';
import { CustomersCards } from './customers-cards';
import { CustomersTable } from './customers-table';
import { CustomerGridSkeleton } from '@/components/skeletons';

interface CustomerGridProps {
  data?: {
    data: CustomersType[];
    meta: Meta;
  };
  loading: boolean;
  onBanned: (user: CustomersType) => void;
  onInactive: (user: CustomersType) => void;
}

export function CustomerGrid({
  data,
  loading,
  onBanned,
  onInactive,
}: CustomerGridProps) {
  if (loading) {
    return <CustomerGridSkeleton />;
  }

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No customers found.' />;
  }

  return (
    <>
      <CustomersCards
        onBanned={onBanned}
        onInactive={onInactive}
        customer={data.data}
      />

      <CustomersTable
        onBanned={onBanned}
        onInactive={onInactive}
        customer={data.data}
        meta={data.meta}
      />
    </>
  );
}
