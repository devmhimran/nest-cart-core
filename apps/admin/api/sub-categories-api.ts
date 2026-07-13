import { api } from '@/lib/fetch';
import { CreateSubCategory } from '@/types';

const path = `/sub-categories`;

export const subCategoriesApi = {
  getSubCategories: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },
  createSubCategory: (data: CreateSubCategory) => {
    return api.post(path, data);
  },
  updateSubCategory: (id: number, data: Partial<CreateSubCategory>) => {
    return api.patch(`${path}/${id}`, data);
  },
  deleteSubCategory: (id: number) => {
    return api.delete(`${path}/${id}`);
  },
};
