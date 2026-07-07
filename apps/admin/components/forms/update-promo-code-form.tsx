'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { usePromoCodes } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PromoCodeType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@repo/ui/lib/utils';
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

interface UpdatePromoCodeFormProps {
  data: PromoCodeType | null;
  setIsOpen: (isOpen: boolean) => void;
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : '';
}

function toIsoDate(value: string) {
  return `${value}T00:00:00.000Z`;
}

export function UpdatePromoCodeForm({
  data,
  setIsOpen,
}: UpdatePromoCodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePromoCodeAsync } = usePromoCodes();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: {
      code: data?.code || '',
      title: data?.title || '',
      amount: data?.amount || 0,
      startDate: toDateInputValue(data?.startDate),
      endDate: toDateInputValue(data?.endDate),
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        code: data.code,
        title: data.title,
        amount: data.amount,
        startDate: toDateInputValue(data.startDate),
        endDate: toDateInputValue(data.endDate),
      });
    }
  }, [data, reset]);

  function onSubmit(formData: PromoCodeFormValues) {
    if (!data?.id) return;

    setIsSubmitting(true);
    const payload = {
      id: data.id,
      payload: {
        code: formData.code,
        title: formData.title,
        amount: formData.amount,
        startDate: toIsoDate(formData.startDate),
        endDate: toIsoDate(formData.endDate),
      },
    };

    toast.promise(updatePromoCodeAsync(payload), {
      loading: 'Updating promo code...',
      success: () => {
        setIsSubmitting(false);
        setIsOpen(false);
        return 'Successfully promo code updated';
      },
      error: (err) => {
        setIsSubmitting(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 pt-2'>
      <FieldSet>
        <FieldGroup className='gap-4'>
          <Field>
            <FieldLabel htmlFor='update-code'>Promo Code</FieldLabel>
            <Input
              id='update-code'
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
                Update the promotional code string.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='update-title'>Title</FieldLabel>
            <Input
              id='update-title'
              placeholder='e.g., Summer Sale 25% Off'
              autoComplete='off'
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title ? (
              <FieldError>{errors.title.message}</FieldError>
            ) : (
              <FieldDescription>
                Update the visible label for this promo.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='update-amount'>Amount</FieldLabel>
            <Input
              id='update-amount'
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
                Update the discount value for this promo code.
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
          type='button'
          variant='outline'
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Update Promo Code
        </Button>
      </div>
    </form>
  );
}
