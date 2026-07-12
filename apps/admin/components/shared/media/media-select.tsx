'use client';

import { MediaLibrarySelectSkeleton } from '@/components/skeletons';
import { useGetAllMedia } from '@/hooks';
import { formatBytes } from '@/lib/utils';
import { CategoryImageType, MediaType } from '@/types';
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  Button,
  Input,
  PaginationContainer,
} from '@repo/ui';
import { generateQueryString } from '@repo/ui/lib/utils';
import { Check, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface MediaSelectProps {
  image: CategoryImageType | CategoryImageType[] | null;
  setImage: (image: CategoryImageType | CategoryImageType[] | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  multiple?: boolean;
}

export function MediaSelect({
  image,
  setImage,
  setIsOpen,
  multiple = false,
}: MediaSelectProps) {
  const [params, setParams] = useState({
    search: '',
    page: '1',
    limit: '12',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const queryString = generateQueryString(params);

  const { fetchAllMediaMutationData, fetchAllMediaMutation } =
    useGetAllMedia(queryString);

  const mediaItems: MediaType[] = fetchAllMediaMutationData?.data?.data || [];

  const isSelected = (item: MediaType) => {
    if (multiple) {
      return Array.isArray(image) && image.some((img) => img.id === item.id);
    }
    return (image as MediaType | null)?.id === item.id;
  };

  const handleSelect = (item: MediaType) => {
    if (multiple) {
      const currentImages = Array.isArray(image) ? image : [];
      const exists = currentImages.some((img) => img.id === item.id);

      if (exists) {
        setImage(currentImages.filter((img) => img.id !== item.id));
      } else {
        setImage([...currentImages, item]);
      }
    } else {
      setImage(item);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='relative flex-1 justify-end items-center py-0.5 mt-2'>
        <Search className='absolute left-2 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search by filename'
          value={searchQuery}
          onChange={(e) => {
            debounced(e.target.value);
            setSearchQuery(e.target.value);
          }}
          className='pl-8'
        />
        {searchQuery && (
          <X
            className='absolute right-2 top-3 h-4 w-4 text-muted-foreground cursor-pointer'
            onClick={() => {
              setSearchQuery('');
              setParams((prevParams) => ({
                ...prevParams,
                search: '',
                page: '1',
              }));
            }}
          />
        )}
      </div>

      {fetchAllMediaMutation.isLoading ? (
        <MediaLibrarySelectSkeleton />
      ) : (
        <AttachmentGroup className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
          {mediaItems.map((item) => {
            const selected = isSelected(item);
            return (
              <Attachment
                key={item.id}
                orientation='vertical'
                onClick={() => handleSelect(item)}
                className={`cursor-pointer transition-all ${
                  selected
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <AttachmentMedia
                  variant='image'
                  className='relative aspect-video w-full overflow-hidden bg-muted'
                >
                  <img
                    src={item.fileUrl}
                    alt={item.fileAlt || item.fileName || item.title}
                    loading='lazy'
                    decoding='async'
                    className='object-cover w-full h-full'
                  />
                  {selected && (
                    <div className='absolute inset-0 bg-primary/10 flex items-center justify-center'>
                      <div className='bg-primary text-primary-foreground rounded-full p-1 shadow'>
                        <Check className='h-4 w-4 stroke-3' />
                      </div>
                    </div>
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle className='line-clamp-1 text-sm'>
                    {item.title || item.fileName}
                  </AttachmentTitle>
                  <AttachmentDescription className='text-xs'>
                    {item.fileType.toUpperCase()} · {formatBytes(item.fileSize)}
                  </AttachmentDescription>
                </AttachmentContent>
              </Attachment>
            );
          })}
        </AttachmentGroup>
      )}

      <PaginationContainer
        meta={fetchAllMediaMutationData?.data?.meta}
        params={params}
        setParams={setParams}
      />

      <div className='flex justify-end'>
        <Button onClick={() => setIsOpen(false)}>Save Changes</Button>
      </div>
    </div>
  );
}
