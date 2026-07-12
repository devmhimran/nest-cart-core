import { mediaLibrary } from '@/api';
import { MediaType, Response } from '@/types';
import { getQueryClient } from '@/lib/react-query';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const queryClient = getQueryClient();

export const useMedia = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const createMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setUploadProgress(0);

      const response = await mediaLibrary.uploadMedia(formData, (progress) => {
        setUploadProgress(progress);
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) =>
      await mediaLibrary.deleteMedia(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  return {
    uploadProgress,
    createMediaMutation,
    createMediaAsync: createMediaMutation.mutateAsync,

    deleteMediaMutation,
    deleteMediaAsync: deleteMediaMutation.mutateAsync,
  };
};

export const useGetAllMedia = (options?: string) => {
  const fetchAllMediaMutation = useQuery<Response<MediaType[]>>({
    queryKey: ['media', options],
    queryFn: async () => {
      const res = await mediaLibrary
        .getAllMedia(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllMediaMutation,
    fetchAllMediaMutationData: fetchAllMediaMutation.data,
  };
};
