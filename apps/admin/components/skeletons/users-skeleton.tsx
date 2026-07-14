import {
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

export function UsersSkeleton() {
  return (
    <>
      <Card className='hidden lg:block'>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-20'>Serial</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className='text-end'>Option</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className='w-20'>
                    <Skeleton className='h-5 w-8' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-40' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-16' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-5 w-24' />
                  </TableCell>
                  <TableCell className='text-end'>
                    <Skeleton className='h-5 w-5 ml-auto' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className='overflow-hidden'>
            <CardContent className='p-4 space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-44' />
                </div>
                <Skeleton className='h-8 w-8 rounded-md' />
              </div>
              <div className='flex gap-2'>
                <Skeleton className='h-5 w-20 rounded-full' />
                <Skeleton className='h-5 w-16 rounded-full' />
              </div>
              <Skeleton className='h-3 w-28' />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
