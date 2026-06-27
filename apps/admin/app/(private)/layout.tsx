'use client';

import { useTheme } from 'next-themes';

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/components/ui/sidebar';
import { AppSidebar } from '@/components/shared';
import { Separator, ThemeToggle } from '@repo/ui';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' />
          <h1 className='text-lg font-semibold'>Nest Cart Core</h1>
          <div className='ml-auto'>
            <div className='flex items-center gap-2'>
              <ThemeToggle setTheme={setTheme} />
            </div>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 md:p-6 p-4 bg-sidebar'>
          {children}
        </div>
      </SidebarInset>
      {/* <NextTopLoader
        color='#0B0B0B'
        showSpinner={false}
        showAtBottom={false}
        shadow='0 0 0 0'
      /> */}
    </SidebarProvider>
  );
}
