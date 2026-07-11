import { api } from '@/lib/fetch';

const path = `/media`;

export const mediaLibrary = {
  getAllMedia: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },

  uploadMedia: (formData: FormData) => {
    return api.post(path, formData);
  },

  deleteMedia: (id: number) => {
    return api.delete(`${path}/${id}`);
  },
};
