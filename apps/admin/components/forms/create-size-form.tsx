'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2Icon, Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from '@repo/ui';
import { useSizes } from '@/hooks';
import { getErrorMessage } from '@repo/ui/lib/utils';

const FormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^\S+$/, 'Only a single word is allowed (no spaces)'),
});

interface CreateSizeFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export function CreateSizeForm({ setIsOpen }: CreateSizeFormProps) {
  const [isPending, setIsPending] = useState(false);
  const { createSizeAsync } = useSizes();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsPending(true);
    toast.promise(createSizeAsync(data), {
      loading: 'Creating size...',
      success: () => {
        setIsPending(false);
        form.reset();
        setIsOpen(false);
        return 'Successfully size created';
      },
      error: (err) => {
        setIsPending(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 pt-2'>
      <FieldSet>
        <FieldGroup className='w-full pt-2'>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='space-y-3'>
                <FieldLabel htmlFor='form-rhf-demo-name'>Size Name</FieldLabel>

                <Input
                  {...field}
                  id='form-rhf-demo-name'
                  aria-invalid={fieldState.invalid}
                  placeholder='e.g., Medium, XL, 32'
                  autoComplete='off'
                  className='w-full font-medium'
                />

                <div className='space-y-1.5 pt-1'>
                  <span className='text-[11px] font-medium text-muted-foreground flex items-center gap-1.5'>
                    <Sparkles className='w-3 h-3 text-amber-500' />
                    Quick Presets
                  </span>
                  <div className='flex flex-wrap gap-1.5'>
                    {SIZE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type='button'
                        onClick={() =>
                          form.setValue('name', preset, {
                            shouldValidate: true,
                          })
                        }
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                          field.value === preset
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>
                    Enter a standard alpha variant or localized unit mapping
                    metric.
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <div className='flex items-center justify-end gap-3 pt-4 border-t'>
        <Button
          type='button'
          variant='outline'
          onClick={() => setIsOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isPending} className='min-w-24'>
          {isPending ? (
            <Loader2Icon className='animate-spin h-4 w-4' />
          ) : (
            'Create Size'
          )}
        </Button>
      </div>
    </form>
  );
}
