'use client';

import {
  Copy,
  Check,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileIcon,
  Calendar,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';

import { MediaType } from '@/types';
import { Button, Separator } from '@repo/ui';
import { formatBytes, handleDownload } from '@/lib/utils';

interface MediaDetailsContentProps {
  media: MediaType | null;
}

const getFileIcon = (type: MediaType['fileType']) => {
  switch (type) {
    case 'pdf':
      return <FileText className='h-12 w-12 text-rose-500' />;
    case 'csv':
    case 'xlsx':
      return <FileSpreadsheet className='h-12 w-12 text-emerald-500' />;
    case 'svg':
      return <FileCode className='h-12 w-12 text-amber-500' />;
    default:
      return <FileIcon className='h-12 w-12 text-muted-foreground' />;
  }
};

export function MediaDetails({ media }: MediaDetailsContentProps) {
  const [copied, setCopied] = useState(false);

  if (!media) return null;

  const isImage = ['webp', 'png', 'jpg', 'jpeg', 'svg'].includes(
    media.fileType,
  );

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(media.fileUrl);
      setCopied(true);
      toast.success('Copied! URL copied to your clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error', { description: 'Failed to copy URL.' });
    }
  };

  const formattedDate = new Date(media.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className='space-y-5 w-full text-left'>
      <div className='relative flex items-center justify-center w-full h-60 rounded-lg border bg-muted/40 overflow-hidden select-none'>
        {isImage ? (
          <img
            src={media.fileUrl}
            alt={media.fileAlt || media.fileName}
            loading='lazy'
            decoding='async'
            className='max-h-full max-w-full object-contain p-2'
          />
        ) : (
          <div className='flex flex-col items-center gap-2'>
            <div className='p-3.5 bg-background rounded-xl border shadow-sm'>
              {getFileIcon(media.fileType)}
            </div>
            <span className='text-[10px] font-bold uppercase bg-muted px-2 py-0.5 rounded text-muted-foreground tracking-wider'>
              {media.fileType}
            </span>
          </div>
        )}
      </div>

      <div className='grid grid-cols-3 gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleCopyUrl}
          className='text-sm flex gap-2 items-center'
        >
          {copied ? (
            <Check className='h-3.5 w-3.5 text-emerald-500' />
          ) : (
            <Copy className='h-3.5 w-3.5' />
          )}
          {copied ? 'Copied' : 'Copy URL'}
        </Button>

        <Button
          variant='outline'
          size='sm'
          onClick={() => handleDownload(media.fileUrl, media.fileName)}
        >
          <Download className='h-3.5 w-3.5' />
          Download
        </Button>

        <Button variant='outline' size='sm'>
          <Link
            href={media.fileUrl}
            target='_blank'
            rel='noreferrer'
            className='flex gap-2 text-sm items-center'
          >
            <ExternalLink className='h-3.5 w-3.5' />
            Open
          </Link>
        </Button>
      </div>

      <Separator />

      <div className='space-y-2.5'>
        <h4 className='text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider'>
          File Information
        </h4>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20 col-span-2'>
            <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                Title
              </p>
              <p className='font-medium mt-1 text-xs'>{media.title || 'N/A'}</p>
            </div>
          </div>
          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20 col-span-2'>
            <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                File Name
              </p>
              <p className='font-medium mt-1 text-xs'>{media.fileName}</p>
            </div>
          </div>
          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20 col-span-2'>
            <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                File Alt
              </p>
              <p className='font-medium mt-1 text-xs'>
                {media.fileAlt || 'N/A'}
              </p>
            </div>
          </div>
          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20'>
            <HardDrive className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                Size
              </p>
              <p className='font-medium mt-1 text-xs'>
                {formatBytes(media.fileSize)}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20'>
            <FileIcon className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                Extension
              </p>
              <p className='font-medium mt-1 text-xs uppercase'>
                {media.fileType}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2 border rounded-lg p-2 bg-muted/20 col-span-2'>
            <Calendar className='h-4 w-4 text-muted-foreground shrink-0' />
            <div>
              <p className='text-[11px] text-muted-foreground leading-none'>
                Uploaded At
              </p>
              <p className='font-medium mt-1 text-xs'>{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
