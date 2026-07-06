'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useColors } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ColorType } from '@/types/color';
import { useState, useEffect } from 'react';
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

interface UpdateColorFormProps {
  data: ColorType | null;
  setIsOpen: (isOpen: boolean) => void;
}

export function UpdateColorForm({ data, setIsOpen }: UpdateColorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateColorAsync } = useColors();

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
      name: data?.name || '',
      hex: data?.hex || '#3B82F6',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        hex: data.hex,
      });
    }
  }, [data, reset]);

  const currentHex = watch('hex');

  function onSubmit(formData: ColorFormValues) {
    if (!data?.id) return;

    setIsSubmitting(true);
    const updatedPayload = { id: data.id, ...formData };

    toast.promise(updateColorAsync(updatedPayload), {
      loading: 'Updating color...',
      success: () => {
        setIsSubmitting(false);
        setIsOpen(false);
        return 'Successfully color updated';
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
          <Field>
            <FieldLabel htmlFor='update-name'>Color Name</FieldLabel>
            <Input
              id='update-name'
              placeholder='e.g., Sky Blue, Crimson'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>
                Modify your design token title description.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='update-hex'>Color Value</FieldLabel>
            <div className='flex items-center gap-2'>
              <div className='relative w-10 h-10 rounded-md border overflow-hidden shrink-0 shadow-sm cursor-pointer bg-muted'>
                <input
                  type='color'
                  id='update-color-picker'
                  className='absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0'
                  value={currentHex || '#000000'}
                  onChange={(e) =>
                    setValue('hex', e.target.value, { shouldValidate: true })
                  }
                />
              </div>

              <Input
                id='update-hex'
                placeholder='#3B82F6'
                className='font-mono uppercase'
                autoComplete='off'
                aria-invalid={!!errors.hex}
                {...register('hex')}
                onPaste={(e) => {
                  e.preventDefault();
                  let pastedData = e.clipboardData.getData('text').trim();
                  if (pastedData && !pastedData.startsWith('#')) {
                    pastedData = `#${pastedData}`;
                  }
                  setValue('hex', pastedData, { shouldValidate: true });
                }}
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
          Update Color
        </Button>
      </div>
    </form>
  );
}
