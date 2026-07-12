'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks';
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

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Category name must be at least 2 characters.' })
    .max(50, { message: 'Category name must be less than 50 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens.',
    }),
  image: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .or(z.literal(''))
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

export function CreateCategoryForm({ setIsOpen }: CreateCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createCategoryAsync } = useCategories();

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
      name: '',
      slug: '',
      image: '',
    },
  });

  const categoryName = watch('name');
  const imageUrl = watch('image');

  useEffect(() => {
    if (categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [categoryName, setValue]);

  function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    toast.promise(createCategoryAsync(data), {
      loading: 'Creating category...',
      success: () => {
        setIsSubmitting(false);
        reset();
        setIsOpen(false);
        return 'Successfully category created';
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
            <FieldLabel htmlFor='name'>Category Name</FieldLabel>
            <Input
              id='name'
              placeholder='e.g., Electronics, Fashion'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>
                Provide a friendly name for this category.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='slug'>Slug</FieldLabel>
            <Input
              id='slug'
              placeholder='e.g., electronics'
              autoComplete='off'
              aria-invalid={!!errors.slug}
              {...register('slug')}
            />
            {errors.slug ? (
              <FieldError>{errors.slug.message}</FieldError>
            ) : (
              <FieldDescription>
                URL-friendly identifier generated automatically or manually adjusted.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='image'>Image URL</FieldLabel>
            <Input
              id='image'
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
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
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
          Save Category
        </Button>
      </div>
    </form>
  );
}
