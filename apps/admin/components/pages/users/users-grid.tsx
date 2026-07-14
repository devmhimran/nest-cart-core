'use client';

import { format } from 'date-fns';
import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';

import {
  Badge,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@repo/ui';
import { Meta } from '@/types';
import { UserRole } from '@/lib/enums';
import { UserCard } from './user-card';
import { cn } from '@repo/ui/lib/utils';
import { UsersType } from '@/types/users';
import { ROLE_LABELS } from '@/lib/constants';
import { EmptyState } from '@/components/shared';
import { UsersSkeleton } from '@/components/skeletons';

interface UsersGridProps {
  data?: {
    data: UsersType[];
    meta: Meta;
  };
  loading: boolean;
  onEdit: (user: UsersType) => void;
  onDelete: (user: UsersType) => void;
}

const roleColor: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:
    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  [UserRole.ADMIN]:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [UserRole.MODERATOR]:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [UserRole.CUSTOMER]:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function UsersGrid({ data, loading, onEdit, onDelete }: UsersGridProps) {
  if (loading) return <UsersSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No users found.' />;
  }

  return (
    <>
      <Card className='hidden lg:block'>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>Serial</TableHead>
                <TableHead className='w-24 max-w-[6rem]'>Name</TableHead>
                <TableHead className='w-68 max-w-[17rem]'>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className='text-end'>Option</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>
                    {(data.meta.currentPage - 1) * data.meta.perPage +
                      index +
                      1}
                    .
                  </TableCell>
                  <TableCell className='font-medium '>
                    <span
                      className='block w-24 truncate'
                      title={`${user.name}`}
                    >
                      {user.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className='block w-68 truncate'
                      title={`${user.email}`}
                    >
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        roleColor[user.role],
                      )}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1.5'>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.emailVerified && (
                        <Badge variant='outline'>Verified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className='text-end'>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant='ghost' size='sm'>
                            <Ellipsis className='w-4 h-4' />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align='end'>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <SquarePen className='w-4 h-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => onDelete(user)}
                          >
                            <Trash2 className='w-4 h-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
        {data.data.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}
