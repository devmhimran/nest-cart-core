'use client';

import { Search, X } from 'lucide-react';
import { MediaCards } from './media-cards';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { generateQueryString } from '@repo/ui/lib/utils';
import { useGetAllMedia } from '@/hooks/use-media-library';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertModal,
  Button,
  Card,
  CardContent,
  Input,
  Separator,
} from '@repo/ui';
import { MediaUploadForm } from './media-upload-form';

export function MediaViewerContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addMediaOpen, setAddMediaOpen] = useState(false);

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  const queryString = generateQueryString(params);
  const { fetchAllMediaMutationData } = useGetAllMedia(queryString);

  useEffect(() => {
    router.replace(queryString, { scroll: false });
  }, [queryString, router]);

  return (
    <Card>
      <CardContent className='space-y-6'>
        <div className='flex md:flex-row flex-col gap-4 justify-between'>
          <div>
            <Button onClick={() => setAddMediaOpen(true)}>Upload Media</Button>
          </div>
          <div className='relative flex-1 justify-end max-w-sm'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
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
                className='absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer'
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
        </div>
        <Separator />

        <MediaCards mediaList={fetchAllMediaMutationData?.data?.data || []} />
      </CardContent>

      <AlertModal
        isOpen={addMediaOpen}
        setIsOpen={setAddMediaOpen}
        title='Upload Media'
      >
        <MediaUploadForm setIsOpen={setAddMediaOpen} />
      </AlertModal>
    </Card>
  );
}
