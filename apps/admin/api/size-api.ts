import { api } from '@/lib/fetch';

export const sizeApi = {
  getSizes: (params?: string) => {
    const url = '/sizes' + (params ? `${params}` : '');
    return api.get(url);
  },
  createSize: (data: { name: string }) => {
    const url = '/sizes';
    return api.post(url, data);
  },
  updateSize: (data: { previousName: string; name: string }) => {
    const url = `/sizes/${data.previousName}`;
    return api.patch(url, { name: data.name });
  },
  deleteSize: (id: string) => {
    const url = `/sizes/${id}`;
    return api.delete(url);
  },
};
