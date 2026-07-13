import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { sizeApi } from '@/api';
import { Response, SizeType } from '@/types';
import { getQueryClient } from '@/lib/react-query';

const queryClient = getQueryClient();

export function useSizes() {
  const createSizeMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await sizeApi
        .createSize(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const updateSizeMutation = useMutation({
    mutationFn: async (data: { previousName: string; name: string }) => {
      const res = await sizeApi
        .updateSize(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  const deleteSizeMutation = useMutation({
    mutationFn: async (id: string) => await sizeApi.deleteSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });
  return {
    createSizeMutation,
    createSize: createSizeMutation.mutate,
    createSizeAsync: createSizeMutation.mutateAsync,

    updateSizeMutation,
    updateSize: updateSizeMutation.mutate,
    updateSizeAsync: updateSizeMutation.mutateAsync,

    deleteSizeMutation,
    deleteSize: deleteSizeMutation.mutate,
    deleteSizeAsync: deleteSizeMutation.mutateAsync,
  };
}

export function useGetAllSizes(options?: string) {
  const fetchAllSizesMutation = useQuery<Response<SizeType[]>>({
    queryKey: ['sizes', options],
    queryFn: async () => {
      const res = await sizeApi
        .getSizes(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllSizesMutation,
    fetchAllSizesMutationData: fetchAllSizesMutation.data,
  };
}
