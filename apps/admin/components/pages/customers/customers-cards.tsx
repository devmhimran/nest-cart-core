import { Mail, Calendar, ShieldBan, ShieldX, Ellipsis } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@repo/ui';
import { CustomersType } from '@/types';

interface CustomerCardProps {
  customer: CustomersType[];
  onBanned: (user: CustomersType) => void;
  onInactive: (user: CustomersType) => void;
}

export function CustomersCards({
  customer,
  onBanned,
  onInactive,
}: CustomerCardProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
      {customer.map((customer) => {
        const initials = customer.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <Card
            key={customer.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-md border-muted-foreground/10
        ${customer.banned ? 'bg-muted/40 opacity-70 border-destructive/20 select-none' : 'bg-card'}`}
          >
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10 border border-muted-foreground/10 bg-muted'>
                  <AvatarFallback className='font-medium text-muted-foreground text-sm'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col space-y-0.5'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold text-sm leading-none tracking-tight text-foreground'>
                      {customer.name}
                    </h3>
                    {customer.banned && (
                      <Badge
                        variant='destructive'
                        className='text-[9px] font-bold uppercase tracking-wider px-1 py-0 h-4 leading-none'
                      >
                        Banned
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant='secondary'
                    className='w-fit text-[10px] font-medium tracking-wide uppercase px-1.5 py-0'
                  >
                    Customer
                  </Badge>
                </div>
              </div>

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
                    <DropdownMenuItem
                      className='text-blue-600'
                      onClick={() => onBanned(customer)}
                    >
                      <ShieldBan /> {customer.banned ? 'Unbanned' : 'Banned'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => onInactive(customer)}
                    >
                      <ShieldX />
                      {customer.isActive ? 'Inactive' : 'Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    {new Date(customer.createdAt).toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      },
                    )}
                  </span>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-1'>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${customer.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`}
                    />
                    <span className='font-medium text-[11px] text-muted-foreground'>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {customer.banned && (
                    <div className='flex items-center space-x-1 border-l border-muted pl-3'>
                      <span className='h-1.5 w-1.5 rounded-full bg-destructive' />
                      <span className='font-medium text-[11px] text-destructive'>
                        Banned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
