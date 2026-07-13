'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { CategoryImageType } from '@/types';
import { MediaSelect } from './media-select';
import { MediaUploadForm } from '@/components/forms/media-upload-form';

interface MediaLibraryChooseProps {
  image: CategoryImageType | CategoryImageType[] | null;
  setImage: (image: CategoryImageType | CategoryImageType[] | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  multiple?: boolean;
}

export function MediaChoose({
  image,
  setImage,
  setIsOpen,
  multiple = false,
}: MediaLibraryChooseProps) {
  const [activeTab, setActiveTab] = useState<'choose' | 'upload'>('choose');

  const handleUploadSuccess = () => {
    setActiveTab('choose');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
      <TabsList className='w-full'>
        <TabsTrigger value='upload'>Upload</TabsTrigger>
        <TabsTrigger value='choose'>Choose</TabsTrigger>
      </TabsList>
      <TabsContent value='upload'>
        <MediaUploadForm setIsOpen={handleUploadSuccess} />
      </TabsContent>
      <TabsContent value='choose'>
        <MediaSelect
          image={image}
          setImage={setImage}
          setIsOpen={setIsOpen}
          multiple={multiple}
        />
      </TabsContent>
    </Tabs>
  );
}
