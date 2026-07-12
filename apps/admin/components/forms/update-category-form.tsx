'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useCategories } from '@/hooks';
import { ImageIcon, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { CategoryImageType, CategoryType } from '@/types';
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
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  Modal,
  AttachmentDescription,
  AttachmentActions,
} from '@repo/ui';
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

interface UpdateCategoryFormProps {
  data: CategoryType | null;
  setIsOpen: (isOpen: boolean) => void;
}

export function UpdateCategoryForm({
  data,
  setIsOpen,
}: UpdateCategoryFormProps) {
  const { updateCategoryAsync } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMediaLibraryModal, setOpenMediaLibraryModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CategoryImageType | null>(
    data?.image
      ? {
          id: data.image.id,
          fileUrl: data.image.fileUrl,
          fileName: data.image.fileName,
          title: data.image.title,
        }
      : null,
  );
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', imageId: null },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name,
      slug: data.slug,
      imageId: data.image?.id ?? null,
    });
  }, [data, reset]);

  const handleSelectImage = (
    image: CategoryImageType | CategoryImageType[] | null,
  ) => {
    if (!image || Array.isArray(image)) return;
    setSelectedImage(image);
    setValue('imageId', image.id, { shouldDirty: true, shouldValidate: true });
    setOpenMediaLibraryModal(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValue('imageId', null, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (formData: CategoryFormValues) => {
    if (!data?.id) return;
    setIsSubmitting(true);
    toast.promise(updateCategoryAsync({ id: data.id, ...formData }), {
      loading: 'Updating category...',
      success: () => {
        setIsSubmitting(false);
        setIsOpen(false);
        return 'Category updated successfully.';
      },
      error: (err) => {
        setIsSubmitting(false);
        return getErrorMessage(err);
      },
    });
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-2'>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='name'> Category Name </FieldLabel>
              <Input
                id='name'
                placeholder='Electronics'
                autoComplete='off'
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name ? (
                <FieldError>{errors.name.message}</FieldError>
              ) : (
                <FieldDescription> Enter the category name. </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor='slug'> Slug </FieldLabel>
              <Input
                id='slug'
                placeholder='electronics'
                autoComplete='off'
                aria-invalid={!!errors.slug}
                {...register('slug')}
              />
              {errors.slug ? (
                <FieldError>{errors.slug.message}</FieldError>
              ) : (
                <FieldDescription> URL friendly identifier. </FieldDescription>
              )}
            </Field>
            {selectedImage ? (
              <Attachment
                orientation='horizontal'
                className='w-full border-2 border-primary/40 bg-muted/20'
              >
                <AttachmentMedia
                  variant='image'
                  className='h-16 w-16 overflow-hidden rounded-md bg-muted'
                >
                  <img
                    src={selectedImage.fileUrl}
                    alt={selectedImage.fileName}
                    className='h-full w-full object-cover'
                    loading='lazy'
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://placehold.co/600x400?text=Image';
                    }}
                  />
                </AttachmentMedia>
                <AttachmentContent className='min-w-0 flex-1 px-2'>
                  <AttachmentTitle className='line-clamp-1'>
                    {selectedImage.title ?? selectedImage.fileName}
                  </AttachmentTitle>
                  <AttachmentDescription>Image selected</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions className='pr-2'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setOpenMediaLibraryModal(true)}
                  >
                    Change
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='text-destructive'
                    onClick={handleRemoveImage}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </AttachmentActions>
              </Attachment>
            ) : (
              <button
                type='button'
                onClick={() => setOpenMediaLibraryModal(true)}
                className='group flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all hover:border-primary/40 hover:bg-muted/20'
              >
                <div className='rounded-lg border bg-background p-3 shadow-sm transition-transform group-hover:scale-105'>
                  <ImageIcon className='h-5 w-5 text-muted-foreground group-hover:text-primary' />
                </div>
                <div className='mt-2 text-center'>
                  <p className='text-sm font-medium'>Select from Library</p>
                  <p className='text-xs text-muted-foreground'>
                    PNG, JPG, WEBP
                  </p>
                </div>
              </button>
            )}
          </FieldGroup>
        </FieldSet>
        <div className='flex justify-end gap-3 border-t pt-4'>
          <Button
            type='button'
            variant='outline'
            disabled={isSubmitting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Update Category
          </Button>
        </div>
      </form>
      <Modal
        isOpen={openMediaLibraryModal}
        setIsOpen={setOpenMediaLibraryModal}
        title='Select Category Image'
        description='Choose an image from your media library.'
      >
        <MediaLibraryChoose
          multiple={false}
          image={selectedImage}
          setIsOpen={setOpenMediaLibraryModal}
          setImage={handleSelectImage}
        />
      </Modal>
    </>
  );
}
