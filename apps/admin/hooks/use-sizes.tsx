import { sizeApi } from '@/api';
import { Response, SizeType } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

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
