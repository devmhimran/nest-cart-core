'use client';

import { categoriesApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { CategoryType, CreateCategoryType, Response } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useCategories() {
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryType) => {
      const res = await categoriesApi
        .createCategory(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CreateCategoryType & { id: number }) => {
      const res = await categoriesApi
        .updateCategory(data.id, {
          name: data.name,
          slug: data.slug,
          imageId: data.imageId,
        })
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => await categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    createCategoryMutation,
    createCategory: createCategoryMutation.mutate,
    createCategoryAsync: createCategoryMutation.mutateAsync,

    updateCategoryMutation,
    updateCategory: updateCategoryMutation.mutate,
    updateCategoryAsync: updateCategoryMutation.mutateAsync,

    deleteCategoryMutation,
    deleteCategory: deleteCategoryMutation.mutate,
    deleteCategoryAsync: deleteCategoryMutation.mutateAsync,
  };
}

export function useGetAllCategories(options?: string) {
  const fetchAllCategoriesMutation = useQuery<Response<CategoryType[]>>({
    queryKey: ['categories', options],
    queryFn: async () => {
      const res = await categoriesApi
        .getCategories(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllCategoriesMutation,
    fetchAllCategoriesMutationData: fetchAllCategoriesMutation.data,
  };
}
