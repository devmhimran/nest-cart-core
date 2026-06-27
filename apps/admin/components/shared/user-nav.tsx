import { ChevronsUpDown, LogOut, User } from 'lucide-react';
import Link from 'next/link';

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

export default function UserNav() {
  const user = {
    name: 'Mahmud Hasan Imran',
    email: 'mahmud.bubt.150@gmail.com',
    role: 'super-admin',
  };
  const initials = user.name.split(' ').filter(Boolean);

  const result = initials[0][0] + initials[initials.length - 1][0];
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
              <span className='truncate text-xs font-medium'>{user.name}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {user.role}
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
              <p className='text-sm font-medium leading-none'>{user.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {user.email}
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
            ></DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='cursor-pointer text-red-600 focus:text-red-600'>
            <LogOut className='mr-2 h-4 w-4' />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
