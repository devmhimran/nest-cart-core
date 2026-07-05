import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
