import { twMerge } from 'tailwind-merge';
import { ApiError } from '../types/common';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQueryString(params: Record<string, string>) {
  const isEmpty = Object.values(params).every((value) => value === '');

  if (isEmpty) {
    return '';
  }

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          value as unknown as string,
        )}`,
    )
    .join('&');

  return `?${queryString}`;
}

export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'Something went wrong';
  }

  if (typeof error === 'string') {
    return error;
  }

  const err = error as ApiError;

  if (err.data?.errors?.length) {
    return err.data.errors.join(', ');
  }

  if (err.data?.message) {
    return err.data.message;
  }

  if (err.message) {
    return err.message;
  }

  return 'Something went wrong';
}
