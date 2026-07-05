import { api } from '@/lib/fetch';

export const sizeApi = {
  getSizes: (params?: string) => {
    const url = '/sizes' + (params ? `${params}` : '');
    return api.get(url);
  },
};
