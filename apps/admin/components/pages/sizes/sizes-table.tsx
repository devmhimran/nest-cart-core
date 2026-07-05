'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSizes } from '@/hooks';
import { Meta, SizeType } from '@/types';
import { UpdateSizeForm } from '@/components/forms';
import { getErrorMessage } from '@repo/ui/lib/utils';
import { SizesSkeleton } from '@/components/skeletons';
import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';
import AlertModal from '@repo/ui/components/shared/alert-modal';

interface SizesTableProps {
  data?: {
    data: SizeType[];
    meta: Meta;
  };
  loading: boolean;
}

export function SizesTable({ data, loading }: SizesTableProps) {
  const [sizeName, setSizeName] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [updateSizeModalOpen, setUpdateSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<SizeType | null>(null);

  const { deleteSizeAsync } = useSizes();

  const handleDeleteSize = () => {
    if (!sizeName) return;
    setLoadingDelete(true);
    toast.promise(deleteSizeAsync(sizeName), {
      loading: 'Deleting size...',
      success: () => {
        setLoadingDelete(false);
        setConfirmModal(false);
        return 'Successfully size deleted';
      },
      error: (err) => {
        setLoadingDelete(false);
        return getErrorMessage(err);
      },
    });
  };

  const handleUpdateSize = (size: SizeType) => {
    setSelectedSize(size);
    setUpdateSizeModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sizes List</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SizesSkeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='text-sm'>
                <TableHead className='w-24'>Serial</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className='text-end'>Option</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((size, index) => (
                <TableRow key={size.id}>
                  <TableCell className='font-medium start'>
                    {(data?.meta?.currentPage - 1) * data?.meta?.perPage +
                      index +
                      1}
                    .
                  </TableCell>
                  <TableCell className='font-medium'>{size.name}</TableCell>
                  <TableCell className='flex justify-end'>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant='ghost' size='sm'>
                            <Ellipsis className='w-4 h-4' />
                          </Button>
                        }
                      />

                      <DropdownMenuContent align='end'>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUpdateSize(size)}
                          >
                            <SquarePen className='w-4 h-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => {
                              setSizeName(size.name);
                              setConfirmModal(true);
                            }}
                          >
                            <Trash2 className='w-4 h-4' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ConfirmModal
        title='This action cannot be undone. This will permanently delete your size'
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={loadingDelete}
        onClick={handleDeleteSize}
      />

      <AlertModal
        isOpen={updateSizeModalOpen}
        setIsOpen={setUpdateSizeModalOpen}
        title='Update size'
      >
        <UpdateSizeForm
          data={selectedSize}
          setIsOpen={setUpdateSizeModalOpen}
        />
      </AlertModal>
    </Card>
  );
}
