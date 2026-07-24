'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { BotIcon } from 'lucide-react';

import { AppSidebar } from '@/components/shared';
import {
  Button,
  ScrollArea,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  ThemeToggle,
} from '@repo/ui';
import { ChatSidebar } from '@/components/shared/ai-chat';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <SidebarProvider className='h-svh w-screen overflow-hidden'>
      <AppSidebar />

      <div className='flex flex-1 h-full w-full overflow-hidden relative'>
        <SidebarInset className='flex flex-col flex-1 min-w-0 h-full overflow-hidden'>
          <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' />
            <h1 className='text-lg font-semibold'>Nest Cart Core</h1>
            <div className='ml-auto'>
              <div className='flex items-center gap-2'>
                <ThemeToggle setTheme={setTheme} />
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  aria-label='Toggle AI Chat'
                >
                  <BotIcon className='h-5 w-5' />
                </Button>
              </div>
            </div>
          </header>

          <ScrollArea className='flex-1 min-h-0 bg-sidebar'>
            <div className='p-4 md:p-6'>{children}</div>
          </ScrollArea>
        </SidebarInset>

        <aside
          className={`h-full border-l bg-background transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isChatOpen
              ? 'w-80 opacity-100'
              : 'w-0 opacity-0 border-none pointer-events-none'
          }`}
        >
          {isChatOpen && (
            <div className='w-80 h-full overflow-hidden'>
              <ChatSidebar
                open={isChatOpen}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          )}
        </aside>
      </div>
    </SidebarProvider>
  );
}
