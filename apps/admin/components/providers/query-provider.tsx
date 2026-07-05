'use client';

import { getQueryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
