'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { subCategoriesApi } from '@/api';
import { getQueryClient } from '@/lib/react-query';
import { CreateSubCategory, Response, SubCategoryType } from '@/types';

const queryClient = getQueryClient();

export function useSubCategories() {
  const createSubCategoryMutation = useMutation({
    mutationFn: async (data: CreateSubCategory) => {
      const res = await subCategoriesApi
        .createSubCategory(data)
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  const updateSubCategoryMutation = useMutation({
    mutationFn: async (data: CreateSubCategory & { id: number }) => {
      const res = await subCategoriesApi
        .updateSubCategory(data.id, {
          name: data.name,
          slug: data.slug,
          categoryId: data.categoryId,
        })
        .then((response) => response.data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (id: number) =>
      await subCategoriesApi.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] });
    },
  });

  return {
    createSubCategoryMutation,
    createSubCategory: createSubCategoryMutation.mutate,
    createSubCategoryAsync: createSubCategoryMutation.mutateAsync,

    updateSubCategoryMutation,
    updateSubCategory: updateSubCategoryMutation.mutate,
    updateSubCategoryAsync: updateSubCategoryMutation.mutateAsync,

    deleteSubCategoryMutation,
    deleteSubCategory: deleteSubCategoryMutation.mutate,
    deleteSubCategoryAsync: deleteSubCategoryMutation.mutateAsync,
  };
}

export function useGetAllSubCategories(options?: string) {
  const fetchAllSubCategoriesMutation = useQuery<Response<SubCategoryType[]>>({
    queryKey: ['sub-categories', options],
    queryFn: async () => {
      const res = await subCategoriesApi
        .getSubCategories(options)
        .then((response) => response.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });
  return {
    fetchAllSubCategoriesMutation,
    fetchAllSubCategoriesMutationData: fetchAllSubCategoriesMutation.data,
  };
}
