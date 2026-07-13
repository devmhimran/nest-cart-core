'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@repo/ui';
import { useSizes } from '@/hooks';
import { SizeType } from '@/types';
import { getErrorMessage } from '@repo/ui/lib/utils';

const FormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^\S+$/, 'Only a single word is allowed (no spaces)'),
});

interface UpdateSizeFormProps {
  data: SizeType | null;
  setIsOpen: (isOpen: boolean) => void;
}

export function UpdateSizeForm({ data, setIsOpen }: UpdateSizeFormProps) {
  const [isPending, setIsPending] = useState(false);
  const { updateSizeAsync } = useSizes();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
    },
  });

  function onSubmit(value: z.infer<typeof FormSchema>) {
    setIsPending(true);
    if (!data?.id) return;

    const payload = {
      previousName: data.name,
      name: value.name,
    };
    toast.promise(updateSizeAsync(payload), {
      loading: 'Updating size...',
      success: () => {
        setIsPending(false);
        form.reset();
        setIsOpen(false);
        return 'Successfully size updated';
      },
      error: (err) => {
        setIsPending(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup className='w-full'>
        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor='form-rhf-demo-name'>Size Name</FieldLabel>
              <Input
                {...field}
                id='form-rhf-demo-name'
                aria-invalid={fieldState.invalid}
                placeholder='Enter size name'
                autoComplete='off'
                className='w-full'
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type='submit'
        disabled={isPending || !form.formState.isDirty}
        className='flex justify-start'
      >
        {isPending && <Loader2Icon className='animate-spin' />}
        Update
      </Button>
    </form>
  );
}
