import { api } from '@/lib/fetch';
import { CreateUserType } from '@/types/users';

const path = `/user`;

export const usersApi = {
  getUsers: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },

  createUser: (data: CreateUserType) => {
    return api.post(path, data);
  },

  updateUser: (id: string, data: Partial<CreateUserType>) => {
    return api.patch(`${path}/${id}`, data);
  },

  deleteUser: (id: string) => {
    return api.delete(`${path}/${id}`);
  },
};
