'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks';
import { ImageIcon, Loader2, X } from 'lucide-react';
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
  Modal,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
} from '@repo/ui';
import { CategoryImageType, MediaType } from '@/types';
import { MediaLibraryChoose } from '../pages/media-library';

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
  imageId: z.number().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

export function CreateCategoryForm({ setIsOpen }: CreateCategoryFormProps) {
  const [selectedImage, setSelectedImage] = useState<
    CategoryImageType | CategoryImageType[] | null
  >(null);
  const [openMediaLibraryModal, setOpenMediaLibraryModal] = useState(false);
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
      imageId: null,
    },
  });

  const categoryName = watch('name');

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
    const { name, slug, imageId } = data;

    setIsSubmitting(true);
    toast.promise(createCategoryAsync({ name, slug, imageId }), {
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

  useEffect(() => {
    if (selectedImage) {
      const imageId = Array.isArray(selectedImage)
        ? selectedImage[0]?.id
        : selectedImage?.id;

      if (imageId !== undefined) {
        setValue('imageId', imageId, { shouldValidate: true });
      }
    }
  }, [selectedImage, setValue]);

  const previewUrl = selectedImage
    ? Array.isArray(selectedImage)
      ? selectedImage[0]?.fileUrl
      : selectedImage?.fileUrl
    : null;

  return (
    <>
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
                  URL-friendly identifier generated automatically or manually
                  adjusted.
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel>Category Image</FieldLabel>

              {previewUrl ? (
                <div className='w-full'>
                  <Attachment
                    orientation='horizontal'
                    className='w-full border-2 border-primary/40 bg-muted/20'
                  >
                    <AttachmentMedia
                      variant='image'
                      className='h-16 w-16 shrink-0 bg-muted overflow-hidden rounded-md'
                    >
                      <img
                        src={previewUrl}
                        alt='Category Preview'
                        className='h-full w-full object-cover'
                        loading='lazy'
                        decoding='async'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/600x400?text=Invalid+Image+URL';
                        }}
                      />
                    </AttachmentMedia>
                    <AttachmentContent className='flex-1 min-w-0 px-2'>
                      <AttachmentTitle className='text-sm font-medium line-clamp-1'>
                        {Array.isArray(selectedImage)
                          ? selectedImage[0]?.title ||
                            selectedImage[0]?.fileName ||
                            'Selected Image'
                          : selectedImage?.title ||
                            selectedImage?.fileName ||
                            'Selected Image'}
                      </AttachmentTitle>
                      <AttachmentDescription className='text-xs text-muted-foreground'>
                        Image successfully linked
                      </AttachmentDescription>
                    </AttachmentContent>
                    <AttachmentActions className='pr-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-8 text-xs font-medium hover:bg-background'
                        onClick={() => setOpenMediaLibraryModal(true)}
                      >
                        Change
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:bg-destructive/10'
                        onClick={() => {
                          setSelectedImage(null);
                          setValue('imageId', null);
                        }}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </AttachmentActions>
                  </Attachment>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => setOpenMediaLibraryModal(true)}
                  className='group flex flex-col items-center justify-center w-full w-full h-32 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 bg-muted/5 hover:bg-muted/20 rounded-xl transition-all space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20'
                >
                  <div className='p-2.5 bg-background border rounded-lg shadow-sm group-hover:scale-105 transition-transform'>
                    <ImageIcon className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                  <div className='text-center'>
                    <p className='text-sm font-medium group-hover:text-primary transition-colors'>
                      Select from Library
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Formats: PNG, JPG, WEBP
                    </p>
                  </div>
                </button>
              )}

              <input type='hidden' {...register('imageId')} />
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
            Save Category
          </Button>
        </div>
      </form>

      <Modal
        isOpen={openMediaLibraryModal}
        setIsOpen={setOpenMediaLibraryModal}
        title='Select Category Image'
        description='check check category image'
      >
        <MediaLibraryChoose
          setIsOpen={setOpenMediaLibraryModal}
          setImage={setSelectedImage}
          image={selectedImage}
          multiple={false}
        />
      </Modal>
    </>
  );
}
