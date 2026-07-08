import { api } from '@/lib/fetch';
import { PromoCodeCreateInput, PromoCodeUpdateInput } from '@/types';

const path = `/promo-codes`;
export const promoCodeApi = {
  getPromoCodes: (params?: string) => {
    const url = path + (params ? `${params}` : '');
    return api.get(url);
  },
  createPromoCode: (data: PromoCodeCreateInput) => {
    return api.post(path, data);
  },
  updatePromoCode: (id: number, data: PromoCodeUpdateInput) => {
    return api.patch(`${path}/${id}`, data);
  },
  deletePromoCode: (id: number) => {
    return api.delete(`${path}/${id}`);
  },
};
