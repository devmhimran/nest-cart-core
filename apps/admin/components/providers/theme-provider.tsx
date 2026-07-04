'use client';

import { Toaster } from 'sonner';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const scriptProps =
    typeof window === 'undefined'
      ? undefined
      : ({ type: 'application/json' } as const);
  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
      <Toaster richColors position='top-center' />
    </NextThemesProvider>
  );
}
