import { api } from '@/lib/fetch';
import { CreateCategoryType } from '@/types';

const path = `/categories`;

export const categoriesApi = {
  getCategories: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },
  createCategory: (data: CreateCategoryType) => {
    return api.post(path, data);
  },
  updateCategory: (id: number, data: Partial<CreateCategoryType>) => {
    return api.put(`${path}/${id}`, data);
  },
  deleteCategory: (id: number) => {
    return api.delete(`${path}/${id}`);
  },
};
