import { Mail, Calendar } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardHeader,
} from '@repo/ui';
import { CustomersType } from '@/types';

interface CustomerCardProps {
  customer: CustomersType;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className='overflow-hidden transition-all duration-200 hover:shadow-md border-muted-foreground/10'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10 border border-muted-foreground/10 bg-muted'>
            <AvatarFallback className='font-medium text-muted-foreground text-sm'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col space-y-1'>
            <h3 className='font-semibold text-sm leading-none tracking-tight text-foreground'>
              {customer.name}
            </h3>
            <Badge
              variant='secondary'
              className='w-fit text-[10px] font-medium tracking-wide capitalize px-1.5 py-0'
            >
              Customer
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-2 flex flex-col space-y-3 text-xs text-muted-foreground'>
        <div className='flex items-center justify-between group'>
          <div className='flex items-center space-x-2 truncate'>
            <Mail className='h-3.5 w-3.5 shrink-0 opacity-60' />
            <span className='truncate selection:bg-primary/10'>
              {customer.email}
            </span>
          </div>
          {customer.emailVerified ? (
            <Badge
              variant='outline'
              className='text-[10px] border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-normal px-1'
            >
              Verified
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='text-[10px] border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-normal px-1'
            >
              Pending
            </Badge>
          )}
        </div>

        <div className='flex items-center justify-between pt-1 border-t border-muted/60'>
          <div className='flex items-center space-x-1.5'>
            <Calendar className='h-3.5 w-3.5 opacity-60' />
            <span>
              Joined{' '}
              {new Date(customer.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className='flex items-center space-x-1.5'>
            <span
              className={`h-1.5 w-1.5 rounded-full ${customer.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`}
            />
            <span className='font-medium text-[11px]'>
              {customer.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
