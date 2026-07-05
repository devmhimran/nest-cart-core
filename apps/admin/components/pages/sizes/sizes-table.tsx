import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Meta, SizeType } from '@/types';
import { SizesSkeleton } from '@/components/skeletons';
import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';

interface SizesTableProps {
  data?: {
    data: SizeType[];
    meta: Meta;
  };
  loading: boolean;
}

export function SizesTable({ data, loading }: SizesTableProps) {
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
                          <DropdownMenuItem>
                            <SquarePen className='w-4 h-4' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
    </Card>
  );
}
