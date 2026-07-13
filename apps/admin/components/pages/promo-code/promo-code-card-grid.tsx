'use client';

import {
  Calendar,
  Ellipsis,
  SquarePen,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
} from '@repo/ui';
import { handleCopy } from '@/lib/utils';
import { PromoCodeType, Meta } from '@/types';
import { EmptyState } from '@/components/shared';
import { PromoCodesSkeleton } from '@/components/skeletons';

interface PromoCodeTableProps {
  data?: {
    data: PromoCodeType[];
    meta: Meta;
  };
  loading: boolean;
  onEdit: (promoCode: PromoCodeType) => void;
  onDelete: (promoCode: PromoCodeType) => void;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function PromoCodeCardGrid({
  data,
  loading,
  onEdit,
  onDelete,
}: PromoCodeTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (loading) return <PromoCodesSkeleton />;

  if (!data?.data || data.data.length === 0) {
    return <EmptyState message='No promo codes found.' />;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold tracking-tight text-foreground'>
          Promo Codes
        </h2>
        <p className='text-sm text-muted-foreground'>
          Manage and monitor active promotional campaigns.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4'>
        {data.data.map((promoCode, index) => {
          const isExpired = new Date(promoCode.endDate) < new Date();
          const globalIndex =
            (data.meta.currentPage - 1) * data.meta.perPage + index + 1;

          return (
            <Card
              key={promoCode.id}
              className='relative overflow-hidden transition-all duration-200 hover:shadow-md border-muted/60 dark:border-muted/20'
            >
              <div
                className={`absolute top-0 left-0 right-0 h-0.75 ${isExpired ? 'bg-muted' : 'bg-primary'}`}
              />

              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3 pt-5'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium text-muted-foreground/80'>
                      #{globalIndex}
                    </span>
                    <CardTitle className='text-base font-semibold tracking-tight'>
                      {promoCode.title}
                    </CardTitle>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    ID: {promoCode.id}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <Badge
                    variant={isExpired ? 'destructive' : 'default'}
                    className='font-medium'
                  >
                    {isExpired ? 'Expired' : 'Active'}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        >
                          <Ellipsis className='w-4 h-4' />
                        </Button>
                      }
                    />

                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(promoCode)}>
                          <SquarePen className='w-4 h-4 mr-2 text-muted-foreground' />
                          Edit Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive focus:bg-destructive/10'
                          onClick={() => onDelete(promoCode)}
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className='pb-5 space-y-4'>
                <div className='flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3'>
                  <div className='space-y-0.5'>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                      Promo Code
                    </span>
                    <div className='font-mono text-sm font-bold uppercase tracking-wider text-foreground'>
                      {promoCode.code}
                    </div>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background'
                    onClick={() => handleCopy(promoCode.code, setCopiedId)}
                  >
                    {copiedId === promoCode.code ? (
                      <CheckCircle className='h-4 w-4 text-emerald-500' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                  </Button>
                </div>

                <div className='grid grid-cols-2 gap-4 rounded-lg bg-muted/10 p-3 text-sm border border-muted/30'>
                  <div>
                    <span className='text-xs text-muted-foreground block mb-0.5'>
                      Discount Value
                    </span>
                    <span className='font-semibold text-foreground text-base'>
                      {promoCode.amount}
                    </span>
                  </div>
                  <div className='border-l border-muted pl-4'>
                    <span className='text-xs text-muted-foreground block mb-0.5'>
                      Campaign Status
                    </span>
                    <span className='flex items-center gap-1.5 font-medium text-xs mt-1'>
                      {isExpired ? (
                        <>
                          <XCircle className='h-3.5 w-3.5 text-muted-foreground' />
                          Ended
                        </>
                      ) : (
                        <>
                          <CheckCircle className='h-3.5 w-3.5 text-emerald-500' />
                          Live
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-1 text-xs text-muted-foreground'>
                  <div className='flex items-center gap-1.5'>
                    <Calendar className='h-3.5 w-3.5 text-muted-foreground/70' />
                    <span>
                      Starts:{' '}
                      <span className='font-medium text-foreground/80'>
                        {formatDate(promoCode.startDate)}
                      </span>
                    </span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <Calendar className='h-3.5 w-3.5 text-muted-foreground/70' />
                    <span>
                      Ends:{' '}
                      <span className='font-medium text-foreground/80'>
                        {formatDate(promoCode.endDate)}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
