'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { usePromoCodes } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@repo/ui/lib/utils';
import { PromoCodeCreateInput } from '@/types';
import {
  FieldSet,
  FieldDescription,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  Button,
  Input,
} from '@repo/ui';
import { DatePickerField } from '../pages/promo-code';

const promoCodeFormSchema = z
  .object({
    code: z
      .string()
      .min(2, { message: 'Promo code must be at least 2 characters.' })
      .max(40, { message: 'Promo code must be less than 40 characters.' })
      .transform((value) => value.toUpperCase()),
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters.' })
      .max(120, { message: 'Title must be less than 120 characters.' }),
    amount: z.number().min(0, {
      message: 'Amount must be greater than or equal to 0.',
    }),
    startDate: z.string().min(1, { message: 'Start date is required.' }),
    endDate: z.string().min(1, { message: 'End date is required.' }),
  })
  .refine((data) => data.endDate > data.startDate, {
    path: ['endDate'],
    message: 'End date must be after start date.',
  });

type PromoCodeFormValues = z.infer<typeof promoCodeFormSchema>;

interface CreatePromoCodeFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

function toIsoDate(value: string) {
  return `${value}T00:00:00.000Z`;
}

export function CreatePromoCodeForm({ setIsOpen }: CreatePromoCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPromoCodeAsync } = usePromoCodes();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: '',
      title: '',
      amount: 0,
      startDate: '',
      endDate: '',
    },
  });

  function onSubmit(data: PromoCodeFormValues) {
    setIsSubmitting(true);

    const payload: PromoCodeCreateInput = {
      code: data.code,
      title: data.title,
      amount: data.amount,
      startDate: toIsoDate(data.startDate),
      endDate: toIsoDate(data.endDate),
    };

    toast.promise(createPromoCodeAsync(payload), {
      loading: 'Creating promo code...',
      success: () => {
        setIsSubmitting(false);
        reset();
        setIsOpen(false);
        return 'Successfully promo code created';
      },
      error: (err) => {
        setIsSubmitting(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-2'>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='code'>Promo Code</FieldLabel>
            <Input
              id='code'
              placeholder='e.g., SUMMER25'
              autoComplete='off'
              className='uppercase font-mono'
              aria-invalid={!!errors.code}
              {...register('code')}
            />
            {errors.code ? (
              <FieldError>{errors.code.message}</FieldError>
            ) : (
              <FieldDescription>
                Use a short, memorable code customers can type quickly.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='title'>Title</FieldLabel>
            <Input
              id='title'
              placeholder='e.g., Summer Sale 25% Off'
              autoComplete='off'
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title ? (
              <FieldError>{errors.title.message}</FieldError>
            ) : (
              <FieldDescription>
                Describe the promotion shown in the admin table.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='amount'>Amount</FieldLabel>
            <Input
              id='amount'
              type='number'
              min='0'
              step='1'
              placeholder='25'
              autoComplete='off'
              aria-invalid={!!errors.amount}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount ? (
              <FieldError>{errors.amount.message}</FieldError>
            ) : (
              <FieldDescription>
                Enter the discount value that should be applied.
              </FieldDescription>
            )}
          </Field>

          <div className='grid gap-4 md:grid-cols-2'>
            <Field>
              <DatePickerField
                name='startDate'
                label='Start Date'
                errors={errors}
                control={control}
              />
            </Field>

            <Field>
              <DatePickerField
                name='endDate'
                label='End Date'
                errors={errors}
                control={control}
              />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
      <div className='flex items-center justify-end gap-3 pt-4 border-t'>
        <Button
          type='submit'
          variant='outline'
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save Promo Code
        </Button>
      </div>
    </form>
  );
}
