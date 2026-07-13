'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/react-query';

const queryClient = getQueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
