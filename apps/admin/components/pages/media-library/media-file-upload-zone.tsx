'use client';

import { UploadCloud, X, FileText } from 'lucide-react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useController } from 'react-hook-form';

import {
  Button,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface FileUploadZoneProps {
  name: string;
}

export function MediaFileUploadZone({ name }: FileUploadZoneProps) {
  const { control, setValue, watch } = useFormContext();
  const {
    fieldState: { error },
  } = useController({ name, control });
  const [isDragActive, setIsDragActive] = useState(false);

  const fileValue = watch(name);
  const isImage =
    fileValue instanceof File && fileValue.type?.startsWith('image/');

  const previewUrl = useMemo(() => {
    if (isImage && fileValue) {
      try {
        return URL.createObjectURL(fileValue);
      } catch (e) {
        console.error('Failed to generate preview URL', e);
        return null;
      }
    }
    return null;
  }, [fileValue, isImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (files && files.length > 0) {
        const file = files[0];
        setValue(name, file, { shouldValidate: true, shouldDirty: true });
      }
    },
    [name, setValue],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setValue(name, null, { shouldValidate: true, shouldDirty: true });
      setValue('title', '');
      setValue('alt', '');
    },
    [name, setValue],
  );

  return (
    <FieldGroup className='w-full space-y-5'>
      {!fileValue ? (
        <Field>
          <FieldLabel className='text-sm font-medium text-muted-foreground'>
            Upload Asset
          </FieldLabel>
          <FieldContent>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={cn(
                'group relative flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center transition-all duration-200 cursor-pointer bg-card/50 hover:bg-accent/40 hover:border-muted-foreground/50',
                isDragActive &&
                  'border-primary bg-primary/5 ring-2 ring-primary/10',
              )}
            >
              <input
                type='file'
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                onChange={(e) => handleFiles(e.target.files)}
                accept='image/*,application/pdf'
              />
              <div className='flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-transform duration-200 group-hover:scale-105'>
                <UploadCloud className='h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors' />
              </div>
              <div className='mt-4 space-y-1'>
                <p className='text-sm font-medium'>
                  <span className='text-primary hover:underline'>
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <FieldDescription className='text-xs text-muted-foreground'>
                  SVG, PNG, JPG, or WEBP (max. 5MB)
                </FieldDescription>
              </div>
            </div>
          </FieldContent>
          <FieldError className='mt-2 text-xs font-medium text-destructive'>
            {error?.message}
          </FieldError>
        </Field>
      ) : (
        <div className='space-y-4 animate-in fade-in-50 duration-200'>
          <div className='relative group flex items-center gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm'>
            <div className='relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40'>
              {isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt='Upload preview'
                  loading='lazy'
                  decoding='async'
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
              ) : (
                <FileText className='h-6 w-6 text-muted-foreground' />
              )}
            </div>

            <div className='flex flex-col min-w-0 flex-1'>
              <span className='text-sm font-medium text-foreground truncate'>
                {fileValue.name}
              </span>
              <span className='text-xs text-muted-foreground mt-0.5'>
                {(fileValue.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={handleClear}
              className='h-8 w-8 rounded-full border border-border bg-background/80 opacity-90 transition-opacity hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100'
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Remove file</span>
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in slide-in-from-top-2 duration-300'>
            <Field>
              <FieldLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Title
              </FieldLabel>
              <FieldContent className='mt-1'>
                <Input
                  {...control.register('title')}
                  placeholder='e.g., Hero section background'
                  className='h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary'
                />
              </FieldContent>
              <FieldDescription className='text-[11px] text-muted-foreground/70'>
                Used internally for asset management.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Alt Text
              </FieldLabel>
              <FieldContent className='mt-1'>
                <Input
                  {...control.register('alt')}
                  placeholder={
                    isImage
                      ? 'Describe the image visual...'
                      : 'Not applicable for files'
                  }
                  disabled={!isImage}
                  className='h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary'
                />
              </FieldContent>
              <FieldDescription className='text-[11px] text-muted-foreground/70'>
                Crucial for SEO and Screen Readers.
              </FieldDescription>
            </Field>
          </div>
        </div>
      )}
    </FieldGroup>
  );
}
