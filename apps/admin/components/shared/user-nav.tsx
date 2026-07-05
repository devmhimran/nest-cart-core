'use client';

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import Link from 'next/link';
import { UserRole } from '@/lib/enums';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS } from '@/lib/constants';
import { UserNavSkeleton } from '../skeletons';
import { signOut, useSession } from '@/lib/auth';
import { getAvatarFallbackText } from '@/lib/utils';
import { ChevronsUpDown, LogOut, User } from 'lucide-react';

export default function UserNav() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  if (isPending) {
    return <UserNavSkeleton />;
  }

  const result = getAvatarFallbackText(session?.user?.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            className='relative h-10 w-full justify-start px-2 text-sm font-normal bg-transparent'
          >
            <Avatar className='h-6 w-6 mr-2'>
              <AvatarFallback className='text-xs bg-gray-200 dark:text-gray-700'>
                {result}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col items-start flex-1 min-w-0'>
              <span className='truncate text-xs font-medium'>
                {session?.user?.name}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {session?.user?.role !== undefined
                  ? ROLE_LABELS[session.user.role as UserRole]
                  : ''}
              </span>
            </div>
            <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-50' />
          </Button>
        }
      />
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {session?.user?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link href='/dashboard/profile' className='cursor-pointer'>
                  <User className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </Link>
              }
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='cursor-pointer text-red-600 focus:text-red-600'
            onClick={async () => {
              await signOut();
              router.replace(window.location.pathname);
            }}
          >
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
