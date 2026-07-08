'use client';

import { colorApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { Response } from '@/types';
import { ColorType } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useColors() {
  const createColorMutation = useMutation({
    mutationFn: async (data: { name: string; hex: string }) => {
      const res = await colorApi
        .createColor(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  const updateColorMutation = useMutation({
    mutationFn: async (data: { id: number; name: string; hex: string }) => {
      const res = await colorApi
        .updateColor(data.id, { name: data.name, hex: data.hex })
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  const deleteColorMutation = useMutation({
    mutationFn: async (id: number) => await colorApi.deleteColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });
  return {
    createColorMutation,
    createColor: createColorMutation.mutate,
    createColorAsync: createColorMutation.mutateAsync,

    updateColorMutation,
    updateColor: updateColorMutation.mutate,
    updateColorAsync: updateColorMutation.mutateAsync,

    deleteColorMutation,
    deleteColor: deleteColorMutation.mutate,
    deleteColorAsync: deleteColorMutation.mutateAsync,
  };
}

export function useGetAllColors(options?: string) {
  const fetchAllColorsMutation = useQuery<Response<ColorType[]>>({
    queryKey: ['colors', options],
    queryFn: async () => {
      const res = await colorApi
        .getColors(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllColorsMutation,
    fetchAllColorsMutationData: fetchAllColorsMutation.data,
  };
}
