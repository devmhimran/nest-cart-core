import { toast } from 'sonner';

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

export const handleCopy = async (
  text: string,
  setCopiedText: (text: string | null) => void,
) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

export const formatBytes = (kb: number) => {
  if (kb === 0) return '0 KB';
  if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${kb.toFixed(1)} KB`;
};

export const handleDownload = async (imageUrl: string, imageName: string) => {
  try {
    const url = imageUrl || '/assets/img/placeholder-image.png';
    const fileName = imageName || 'customized-image.png';

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);

    toast.success('Download started!');
  } catch {
    toast.error(
      'Failed to download image. Please try opening in a new tab and saving manually.',
    );
  }
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];
