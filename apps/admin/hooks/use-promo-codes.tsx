'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { promoCodeApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { PromoCodeCreateInput, PromoCodeType, Response } from '@/types';

const queryClient = getQueryClient();

type UpdatePromoCodePayload = {
  id: number;
  payload: Partial<PromoCodeCreateInput>;
};

export function usePromoCodes() {
  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: PromoCodeCreateInput) => {
      const res = await promoCodeApi
        .createPromoCode(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const updatePromoCodeMutation = useMutation({
    mutationFn: async (data: UpdatePromoCodePayload) => {
      const res = await promoCodeApi
        .updatePromoCode(data.id, data.payload)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => await promoCodeApi.deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });

  return {
    createPromoCodeMutation,
    createPromoCode: createPromoCodeMutation.mutate,
    createPromoCodeAsync: createPromoCodeMutation.mutateAsync,

    updatePromoCodeMutation,
    updatePromoCode: updatePromoCodeMutation.mutate,
    updatePromoCodeAsync: updatePromoCodeMutation.mutateAsync,

    deletePromoCodeMutation,
    deletePromoCode: deletePromoCodeMutation.mutate,
    deletePromoCodeAsync: deletePromoCodeMutation.mutateAsync,
  };
}

export function useGetAllPromoCodes(options?: string) {
  const fetchAllPromoCodesMutation = useQuery<Response<PromoCodeType[]>>({
    queryKey: ['promo-codes', options],
    queryFn: async () => {
      const res = await promoCodeApi
        .getPromoCodes(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  return {
    fetchAllPromoCodesMutation,
    fetchAllPromoCodesMutationData: fetchAllPromoCodesMutation.data,
  };
}
