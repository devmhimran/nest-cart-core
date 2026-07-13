'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { Loader2, ListTree } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  FieldSet,
  FieldDescription,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useSubCategories, useGetAllCategories } from '@/hooks';
import { getErrorMessage } from '@repo/ui/lib/utils';

const subCategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Sub category name must be at least 2 characters.' })
    .max(50, { message: 'Sub category name must be less than 50 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        'Slug must contain only lowercase letters, numbers, and hyphens.',
    }),
  categoryId: z.number({ message: 'Please select a category.' }),
});

type SubCategoryFormValues = z.infer<typeof subCategoryFormSchema>;

interface CreateSubCategoryFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

export function CreateSubCategoryForm({
  setIsOpen,
}: CreateSubCategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createSubCategoryAsync } = useSubCategories();
  const { fetchAllCategoriesMutationData } = useGetAllCategories('');

  const categories = useMemo(() => {
    return fetchAllCategoriesMutationData?.data?.data || [];
  }, [fetchAllCategoriesMutationData]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<SubCategoryFormValues>({
    resolver: zodResolver(subCategoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      categoryId: undefined,
    },
  });

  const categoryValue = watch('categoryId');
  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === categoryValue)?.name,
    [categoryValue, categories],
  );

  const subCategoryName = watch('name');

  useEffect(() => {
    if (subCategoryName) {
      const generatedSlug = subCategoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [subCategoryName, setValue]);

  function onSubmit(data: SubCategoryFormValues) {
    setIsSubmitting(true);
    toast.promise(createSubCategoryAsync(data), {
      loading: 'Creating sub category...',
      success: () => {
        setIsSubmitting(false);
        reset();
        setIsOpen(false);
        return 'Sub category created successfully';
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
            <FieldLabel htmlFor='name'>Sub Category Name</FieldLabel>
            <Input
              id='name'
              placeholder='e.g., Laptops, Sneakers'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>
                Provide a name for this sub category.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='slug'>Slug</FieldLabel>
            <Input
              id='slug'
              placeholder='e.g., laptops'
              autoComplete='off'
              aria-invalid={!!errors.slug}
              {...register('slug')}
            />
            {errors.slug ? (
              <FieldError>{errors.slug.message}</FieldError>
            ) : (
              <FieldDescription>
                URL-friendly identifier generated automatically.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel>Parent Category</FieldLabel>
            <Controller
              name='categoryId'
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a category...'>
                      {selectedCategoryName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          <div className='flex items-center gap-2'>
                            <ListTree className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                        No categories available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId ? (
              <FieldError>{errors.categoryId.message}</FieldError>
            ) : (
              <FieldDescription>
                Choose the parent category for this sub category.
              </FieldDescription>
            )}
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
          Save Sub Category
        </Button>
      </div>
    </form>
  );
}
