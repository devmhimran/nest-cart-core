'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@repo/ui';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^\S+$/, 'Only a single word is allowed (no spaces)'),
});

export function CreateSizeForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log({ data });
    // Handle form submission
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

      <Button type='submit' disabled={isPending} className='flex justify-start'>
        {isPending && <Loader2Icon className='animate-spin' />}
        Create
      </Button>
    </form>
  );
}
