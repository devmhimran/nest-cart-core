'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useCategories } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CategoryType } from '@/types';
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

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters.' })
    .max(50, { message: 'Category name must be less than 50 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        'Slug must contain only lowercase letters, numbers, and hyphens.',
    }),
  image: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface UpdateCategoryFormProps {
  data: CategoryType | null;
  setIsOpen: (isOpen: boolean) => void;
}

export function UpdateCategoryForm({
  data,
  setIsOpen,
}: UpdateCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCategoryAsync } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: data?.name || '',
      slug: data?.slug || '',
      image: data?.image || '',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        slug: data.slug,
        image: data.image || '',
      });
    }
  }, [data, reset]);

  const imageUrl = watch('image');

  function onSubmit(formData: CategoryFormValues) {
    if (!data?.id) return;

    setIsSubmitting(true);
    const updatedPayload = { id: data.id, ...formData };

    toast.promise(updateCategoryAsync(updatedPayload), {
      loading: 'Updating category...',
      success: () => {
        setIsSubmitting(false);
        setIsOpen(false);
        return 'Successfully category updated';
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
            <FieldLabel htmlFor='update-name'>Category Name</FieldLabel>
            <Input
              id='update-name'
              placeholder='e.g., Electronics, Fashion'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>
                Modify category name descriptor.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='update-slug'>Slug</FieldLabel>
            <Input
              id='update-slug'
              placeholder='e.g., electronics'
              autoComplete='off'
              aria-invalid={!!errors.slug}
              {...register('slug')}
            />
            {errors.slug ? (
              <FieldError>{errors.slug.message}</FieldError>
            ) : (
              <FieldDescription>
                Unique resource locator handle.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='update-image'>Image URL</FieldLabel>
            <Input
              id='update-image'
              placeholder='e.g., https://example.com/image.jpg'
              autoComplete='off'
              aria-invalid={!!errors.image}
              {...register('image')}
            />
            {errors.image ? (
              <FieldError>{errors.image.message}</FieldError>
            ) : (
              <FieldDescription>
                Public URL to the category image asset.
              </FieldDescription>
            )}
          </Field>

          {imageUrl && (
            <div className='mt-2 border rounded-lg p-2 bg-muted/20 flex items-center justify-center h-32 overflow-hidden'>
              <img
                src={imageUrl}
                alt='Category Preview'
                className='h-full object-contain rounded'
                loading='lazy'
                decoding='async'
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
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
          Update Category
        </Button>
      </div>
    </form>
  );
}
