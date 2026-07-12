export type ApiError = {
  message?: string;
  data?: {
    errors?: string[];
    message?: string;
  };
};

export type Meta = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
};
export type Response<X> = {
  success: boolean;
  status: number;
  timeStamp: string;
  data: {
    data: X;
    meta: Meta;
  };
};
