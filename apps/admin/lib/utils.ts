import { ENV } from '@/config/env';

export const baseUrl = ENV.NEXT_PUBLIC_API_URL + '/api/v1';

export const getAvatarFallbackText = (name?: string) => {
  const initials = name?.trim().split(/\s+/).filter(Boolean);
  return initials && initials.length > 0
    ? (initials.length === 1
        ? initials[0][0]
        : initials[0][0] + initials[initials.length - 1][0]
      ).toUpperCase()
    : '';
};
