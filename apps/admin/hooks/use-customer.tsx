'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { customerApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { CustomersType, Response } from '@/types';

const queryClient = getQueryClient();

export function useCustomer() {
  const bannedCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await customerApi
        .bannedCustomer(id)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const inactiveCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await customerApi
        .inactiveCustomer(id)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    bannedCustomerMutation,
    bannedCustomer: bannedCustomerMutation.mutate,
    bannedCustomerAsync: bannedCustomerMutation.mutateAsync,

    inactiveCustomerMutation,
    inactiveCustomer: inactiveCustomerMutation.mutate,
    inactiveCustomerAsync: inactiveCustomerMutation.mutateAsync,
  };
}

export function useGetAllCustomer(options?: string) {
  const fetchAllCustomersMutation = useQuery<Response<CustomersType[]>>({
    queryKey: ['customers', options],
    queryFn: async () => {
      const res = await customerApi
        .getAllCustomers(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    fetchAllCustomersMutation,
    fetchAllCustomersMutationData: fetchAllCustomersMutation.data,
  };
}
