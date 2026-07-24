'use client';

import { chatApi } from '@/api';
import { AiChatConversation, Response } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useGetAiChat(options?: string) {
  const fetchAiChatsMutation = useQuery<Response<AiChatConversation[]>>({
    queryKey: ['colors', options],
    queryFn: async () => {
      const res = await chatApi
        .getConversations()
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAiChatsMutation,
    fetchAiChatsMutationData: fetchAiChatsMutation.data,
  };
}
