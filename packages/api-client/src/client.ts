import { FetchOptions, ApiResponse, ApiError } from './types';

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function createApiInstance(defaultOptions: FetchOptions = {}) {
  const { baseUrl = '', ...instanceDefaults } = defaultOptions;

  async function request<T>(
    url: string,
    options: FetchOptions = {},
  ): Promise<any> {
    const mergedOptions = { ...instanceDefaults, ...options };
    const { params, data, headers, stream, ...config } = mergedOptions;

    const queryString = buildQueryString(params);
    const fullUrl = `${baseUrl}${url}${queryString}`;

    const finalHeaders = new Headers(headers);
    let body: any = config.body;

    if (data && !body) {
      if (data instanceof FormData) {
        body = data;
      } else {
        finalHeaders.set('Content-Type', 'application/json');
        body = JSON.stringify(data);
      }
    }

    const fetchConfig: RequestInit = {
      ...config,
      headers: finalHeaders,
      body,
      credentials: config.credentials || 'include',
    };

    const response = await fetch(fullUrl, fetchConfig);

    if (response.ok && stream) {
      return response;
    }

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const apiError = new ApiError(
        responseData?.message || `HTTP error! status: ${response.status}`,
        response.status,
        responseData,
      );
      if (options.onResponseError) options.onResponseError(apiError);
      else if (instanceDefaults.onResponseError)
        instanceDefaults.onResponseError(apiError);

      throw apiError;
    }

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  return {
    get: <T>(url: string, options?: FetchOptions) =>
      request<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
      request<T>(url, { ...options, method: 'POST', data }),
    put: <T>(url: string, data?: unknown, options?: FetchOptions) =>
      request<T>(url, { ...options, method: 'PUT', data }),
    patch: <T>(url: string, data?: unknown, options?: FetchOptions) =>
      request<T>(url, { ...options, method: 'PATCH', data }),
    delete: <T>(url: string, options?: FetchOptions) =>
      request<T>(url, { ...options, method: 'DELETE' }),
    stream: (
      url: string,
      data?: unknown,
      options?: FetchOptions,
    ): Promise<Response> =>
      request(url, { ...options, method: 'POST', data, stream: true }),
  };
}
