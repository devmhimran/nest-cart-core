import { api } from '@/lib/fetch';

const path = `/colors`;

export const colorApi = {
  getColors: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },
  createColor: (data: { name: string; hex: string }) => {
    return api.post(path, data);
  },
  updateColor: (id: number, data: { name: string; hex: string }) => {
    return api.put(`${path}/${id}`, data);
  },
  deleteColor: (id: number) => {
    return api.delete(`${path}/${id}`);
  },
};
