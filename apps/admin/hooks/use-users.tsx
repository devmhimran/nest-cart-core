'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { usersApi } from '@/api';
import { Response } from '@/types';
import { getQueryClient } from '@/lib/react-query';
import { CreateUserType, UsersType } from '@/types/users';

const queryClient = getQueryClient();

export function useUsers() {
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserType) => {
      const res = await usersApi
        .createUser(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<CreateUserType> & { id: string }) => {
      const res = await usersApi
        .updateUser(data.id, {
          name: data.name,
          email: data.email,
          role: data.role,
        })
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => await usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    createUserMutation,
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,

    updateUserMutation,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,

    deleteUserMutation,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
  };
}

export function useGetAllUsers(options?: string) {
  const fetchAllUsersMutation = useQuery<Response<UsersType[]>>({
    queryKey: ['users', options],
    queryFn: async () => {
      const res = await usersApi
        .getUsers(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllUsersMutation,
    fetchAllUsersMutationData: fetchAllUsersMutation.data,
  };
}
