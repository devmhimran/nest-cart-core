import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';
import { UsersType } from '@/types/users';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/lib/enums';

interface UserCardProps {
  user: UsersType;
  onEdit: (user: UsersType) => void;
  onDelete: (user: UsersType) => void;
}

const roleColor: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  [UserRole.ADMIN]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [UserRole.MODERATOR]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [UserRole.CUSTOMER]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card className='relative overflow-hidden'>
      <CardHeader className='flex-row items-start justify-between gap-2'>
        <div className='space-y-1'>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant='ghost' size='sm' className='shrink-0'>
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
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', roleColor[user.role])}>
            {ROLE_LABELS[user.role]}
          </span>
          <Badge variant={user.isActive ? 'default' : 'secondary'}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {user.emailVerified && (
            <Badge variant='outline'>Verified</Badge>
          )}
        </div>
        <p className='text-xs text-muted-foreground'>
          Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
}
