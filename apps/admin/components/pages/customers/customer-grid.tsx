import { Ellipsis, ShieldBan, ShieldX } from 'lucide-react';

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
  DropdownMenuTrigger,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { CustomersType, Meta } from '@/types';
import { CustomerCard } from './customer-card';
import { EmptyState } from '@/components/shared';
import { CustomerGridSkeleton } from '@/components/skeletons';

interface CustomerGridProps {
  data?: {
    data: CustomersType[];
    meta: Meta;
  };
  loading: boolean;
  onBanned: (user: CustomersType) => void;
  onInactive: (user: CustomersType) => void;
}

export function CustomerGrid({
  data,
  loading,
  onBanned,
  onInactive,
}: CustomerGridProps) {
  if (loading) {
    return <CustomerGridSkeleton />;
  }

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No customers found.' />;
  }

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
        {data.data.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      <ScrollArea className='hidden lg:block h-[46vh] w-full'>
        <Card className=' m-1'>
          <CardContent>
            <Table>
              <TableHeader className='bg-muted/40'>
                <TableRow>
                  <TableHead className='w-15'>Serial</TableHead>
                  <TableHead className='w-32 max-w-32'>Name</TableHead>
                  <TableHead className='w-70 max-w-70'>Email Address</TableHead>
                  <TableHead className='w-30'>Verification</TableHead>
                  <TableHead className='w-20'>Status</TableHead>
                  <TableHead className='w-20'>Banned</TableHead>
                  <TableHead className='w-24'>Joined Date</TableHead>
                  <TableHead className='w-14'>Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    <TableCell className='font-medium'>
                      {' '}
                      {(data.meta.currentPage - 1) * data.meta.perPage +
                        index +
                        1}
                      .
                    </TableCell>

                    <TableCell className='font-medium '>
                      <span
                        className='block w-32 truncate'
                        title={`${customer.name}`}
                      >
                        {customer.name}
                      </span>
                    </TableCell>

                    <TableCell className='text-muted-foreground text-sm w-60'>
                      <span
                        className='block w-70 truncate'
                        title={`${customer.email}`}
                      >
                        {customer.email}
                      </span>
                    </TableCell>

                    <TableCell>
                      {customer.emailVerified ? (
                        <Badge
                          variant='outline'
                          className='border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-normal px-1.5'
                        >
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 font-normal px-1.5'
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className='flex items-center space-x-1.5'>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${customer.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/40'}`}
                        />
                        <span className='text-xs font-medium text-muted-foreground'>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-1.5'>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${customer.banned ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/40'}`}
                        />
                        <span className='text-xs font-medium text-muted-foreground'>
                          {customer.banned ? 'Banned' : 'Not Banned'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className='text-muted-foreground text-xs'>
                      {new Date(customer.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </TableCell>
                    <TableCell>
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
                              <ShieldBan />{' '}
                              {customer.banned ? 'Unbanned' : 'Banned'}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ScrollArea>
    </>
  );
}
