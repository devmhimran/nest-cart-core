import { api } from '@/lib/fetch';

const path = `/customers`;

export const customerApi = {
  getAllCustomers: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },
  bannedCustomer: (customerId: string) => {
    const url = `${path}/ban/${customerId}`;
    return api.patch(url);
  },
  inactiveCustomer: (customerId: string) => {
    const url = `${path}/inactive/${customerId}`;
    return api.patch(url);
  },
};
