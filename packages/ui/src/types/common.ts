export type ApiError = {
  message?: string;
  data?: {
    errors?: string[];
    message?: string;
  };
};
