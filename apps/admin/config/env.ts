export const ENV = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    '⚠️ Warning: NEXT_PUBLIC_API_URL is not explicitly set. Falling back to localhost.',
  );
}
