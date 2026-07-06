'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useColors } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

const colorFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Color name must be at least 2 characters.' })
    .max(50, { message: 'Color name must be less than 50 characters.' }),
  hex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Please enter a valid hex color code (e.g., #000000 or #FFF).',
  }),
});

type ColorFormValues = z.infer<typeof colorFormSchema>;

interface CreateColorFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

export function CreateColorForm({ setIsOpen }: CreateColorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createColorAsync } = useColors();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: '',
      hex: '#3B82F6',
    },
  });

  const currentHex = watch('hex');

  function onSubmit(data: z.infer<typeof colorFormSchema>) {
    setIsSubmitting(true);
    toast.promise(createColorAsync(data), {
      loading: 'Creating color...',
      success: () => {
        setIsSubmitting(false);
        reset();
        setIsOpen(false);
        return 'Successfully color created';
      },
      error: (err) => {
        setIsSubmitting(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-2'>
      <FieldSet>
        <FieldGroup>
          {/* 1. Name Field Configuration */}
          <Field>
            <FieldLabel htmlFor='name'>Color Name</FieldLabel>
            <Input
              id='name'
              placeholder='e.g., Sky Blue, Crimson'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>
                Give your color a recognizable name.
              </FieldDescription>
            )}
          </Field>

          {/* 2. Color Code Field with Swatch Integration */}
          <Field>
            <FieldLabel htmlFor='hex'>Color Value</FieldLabel>
            <div className='flex items-center gap-2'>
              {/* Native Picker Wrapper */}
              <div className='relative w-10 h-10 rounded-md border overflow-hidden shrink-0 shadow-sm cursor-pointer bg-muted'>
                <input
                  type='color'
                  id='color-picker'
                  className='absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0'
                  value={currentHex || '#000000'}
                  onChange={(e) =>
                    setValue('hex', e.target.value, { shouldValidate: true })
                  }
                />
              </div>

              <Input
                id='hex'
                placeholder='#3B82F6'
                className='font-mono uppercase'
                autoComplete='off'
                aria-invalid={!!errors.hex}
                onPaste={(e) => {
                  e.preventDefault();
                  let pastedData = e.clipboardData.getData('text').trim();
                  if (pastedData && !pastedData.startsWith('#')) {
                    pastedData = `#${pastedData}`;
                  }
                  setValue('hex', pastedData, { shouldValidate: true });
                }}
                {...register('hex')}
              />
            </div>
            {errors.hex && <FieldError>{errors.hex.message}</FieldError>}
          </Field>
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
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save Color
        </Button>
      </div>
    </form>
  );
}
