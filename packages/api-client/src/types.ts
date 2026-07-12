export interface FetchOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  onResponseError?: (error: ApiError) => void;
  stream?: boolean;
  onUploadProgress?: (progress: number) => void;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
