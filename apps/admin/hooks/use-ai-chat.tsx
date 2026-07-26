'use client';

import { chatApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { AiChatConversation, Response } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useAiChatOptions() {
  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => await chatApi.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    deleteConversationMutation,
    deleteConversation: deleteConversationMutation.mutate,
    deleteConversationMutationAsync: deleteConversationMutation.mutateAsync,
  };
}

export function useGetAiChat(options?: string) {
  const fetchAiChatsMutation = useQuery<Response<AiChatConversation[]>>({
    queryKey: ['conversations', options],
    queryFn: async () => {
      const res = await chatApi
        .getConversations(options)
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

export function useGetConversation(chatId: string | null) {
  const fetchConversationQuery = useQuery({
    queryKey: ['conversation', chatId],
    queryFn: async () => {
      if (!chatId) return null;
      const res = await chatApi.getConversation(chatId).then((r) => r.data);
      return res?.data ?? res;
    },
    enabled: !!chatId,
  });

  return {
    fetchConversationQuery,
    conversationData: fetchConversationQuery.data,
  };
}
