'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { useState } from 'react';
import { MediaUploadForm } from './media-upload-form';
import { MediaLibrarySelect } from './media-library-select';
import { CategoryImageType } from '@/types';

interface MediaLibraryChooseProps {
  image: CategoryImageType | CategoryImageType[] | null;
  setImage: (image: CategoryImageType | CategoryImageType[] | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  multiple?: boolean;
}

export function MediaLibraryChoose({
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
        <MediaLibrarySelect
          image={image}
          setImage={setImage}
          setIsOpen={setIsOpen}
          multiple={multiple}
        />
      </TabsContent>
    </Tabs>
  );
}
