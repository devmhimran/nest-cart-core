import { Search, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

interface ParamsProps {
  search: string;
  page: string;
  role: string;
  status: string;
}

interface UsersSearchContainerProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  params: ParamsProps;
  setParams: Dispatch<SetStateAction<ParamsProps>>;
  debounced: (value: string) => void;
}

const userRole = [
  { value: '', label: 'All Roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MODERATOR', label: 'Moderator' },
];

const status = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function UsersSearchContainer({
  searchQuery,
  setSearchQuery,
  params,
  setParams,
  debounced,
}: UsersSearchContainerProps) {
  return (
    <Card className='gap-4 py-4'>
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by name'
              value={searchQuery}
              onChange={(e) => {
                debounced(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className='pl-8'
            />
          </div>
          <Select
            items={userRole}
            value={params.role}
            onValueChange={(value) =>
              setParams((prev) => ({ ...prev, page: '1', role: value ?? '' }))
            }
          >
            <SelectTrigger className='w-full md:w-44 shadow-none'>
              <SelectValue placeholder='User Role' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {userRole.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={status}
            value={params.status}
            onValueChange={(value) =>
              setParams((prev) => ({ ...prev, page: '1', status: value ?? '' }))
            }
          >
            <SelectTrigger className='w-full md:w-40 shadow-none'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {status.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-wrap gap-2'>
          {params.search && (
            <Badge variant='outline'>
              {params.search}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    search: '',
                  }));
                  setSearchQuery('');
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
          {params.role && (
            <Badge variant='outline'>
              {userRole.find((item) => item.value === params.role)?.label}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    role: '',
                  }));
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
          {params.status && (
            <Badge variant='outline'>
              {status.find((item) => item.value === params.status)?.label}{' '}
              <span
                onClick={() => {
                  setParams((prev) => ({
                    ...prev,
                    status: '',
                  }));
                }}
              >
                <X className='w-4 h-4 cursor-pointer' />
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
