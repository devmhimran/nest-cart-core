export interface PromoCodeType {
  id: number;
  code: string;
  title: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export type PromoCodeCreateInput = Omit<
  PromoCodeType,
  'id' | 'createdAt' | 'updatedAt'
>;

export type PromoCodeUpdateInput = Partial<PromoCodeCreateInput>;
