'use client';

import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@repo/ui';
import { useMedia } from '@/hooks';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { MediaFileUploadZone } from './media-file-upload-zone';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/utils';

export const fileUploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, 'File is required.')
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max wallet size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only .jpg, .jpeg, .png, .webp and .svg files are accepted.',
    ),
  title: z.string().optional(),
  alt: z.string().optional(),
});

export type FileUploadFormValues = z.infer<typeof fileUploadSchema>;

interface MediaUploadFormProps {
  setIsOpen?: (isOpen: boolean) => void;
}

export function MediaUploadForm({ setIsOpen }: MediaUploadFormProps) {
  const { createMediaAsync, createMediaMutation } = useMedia();

  const methods = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      file: null,
      title: '',
      alt: '',
    },
  });

  const { handleSubmit, reset } = methods;
  const isLoading = createMediaMutation.isPending;

  const onSubmit = async (data: FileUploadFormValues) => {
    const formData = new FormData();

    formData.append('media', data.file);

    if (data.title) formData.append('title', data.title);
    if (data.alt) formData.append('file_alt', data.alt);

    toast.promise(createMediaAsync(formData), {
      loading: 'Uploading media...',
      success: () => {
        reset();
        if (setIsOpen) {
          setIsOpen(false);
        }
        return 'Media uploaded successfully!';
      },
      error: () => {
        return 'Failed to upload media. Please try again.';
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='p-1'>
          <MediaFileUploadZone name='file' />
        </div>

        <div className='flex justify-end gap-3 border-t pt-4 border-border'>
          <Button
            type='button'
            variant='outline'
            disabled={isLoading}
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button type='submit' disabled={isLoading} className='min-w-25'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              'Save Asset'
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
