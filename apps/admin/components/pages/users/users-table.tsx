import { format } from 'date-fns';
import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Meta } from '@/types';
import { UserRole } from '@/lib/enums';
import { cn } from '@repo/ui/lib/utils';
import { UsersType } from '@/types/users';
import { ROLE_LABELS } from '@/lib/constants';

const roleColor: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:
    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  [UserRole.ADMIN]:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [UserRole.MODERATOR]:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [UserRole.CUSTOMER]:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

interface UsersTableProps {
  users: UsersType[];
  meta: Meta;
  onEdit: (user: UsersType) => void;
  onDelete: (user: UsersType) => void;
}

export function UsersTable({ users, meta, onEdit, onDelete }: UsersTableProps) {
  return (
    <ScrollArea className='hidden lg:block h-[46vh] w-full'>
      <Card className=' m-1'>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>Serial</TableHead>
                <TableHead className='w-32 max-w-32'>Name</TableHead>
                <TableHead className='w-68 max-w-68'>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className='text-end'>Option</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className='font-medium'>
                    {(meta.currentPage - 1) * meta.perPage + index + 1}.
                  </TableCell>
                  <TableCell className='font-medium '>
                    <span
                      className='block w-32 truncate'
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
                      <Badge
                        variant={user.isActive ? 'default' : 'secondary'}
                      >
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
    </ScrollArea>
  );
}
