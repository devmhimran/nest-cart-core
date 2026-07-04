import { baseUrl } from './utils';
import { createApiInstance, ApiError } from '@repo/api-client';

export const api = createApiInstance({
  baseUrl: baseUrl,
  onResponseError: (error) => {
    if (error.status === 401 && typeof window !== 'undefined') {
      console.warn('Unauthorized! Redirecting to login...');
      window.location.href = '/signin';
    }
  },
});

export { ApiError };
