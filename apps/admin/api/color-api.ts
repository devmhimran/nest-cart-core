import { api } from '@/lib/fetch';

export const colorApi = {
  getColors: (params?: string) => {
    const url = '/colors' + (params ? `${params}` : '');
    return api.get(url);
  },
  createColor: (data: { name: string; hex: string }) => {
    return api.post('/colors', data);
  },
  updateColor: (id: number, data: { name: string; hex: string }) => {
    return api.put(`/colors/${id}`, data);
  },
  deleteColor: (id: number) => {
    return api.delete(`/colors/${id}`);
  },
};
