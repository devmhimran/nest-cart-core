import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import {
  Button,
  Calendar,
  Field,
  FieldError,
  FieldLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui';
import { cn } from '@repo/ui/lib/utils';

interface DatePickerFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  errors: FieldErrors<T>;
}

export function DatePickerField<T extends FieldValues>({
  name,
  label,
  control,
  errors,
}: DatePickerFieldProps<T>) {
  const fieldError = errors[name];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field className='flex flex-col'>
          <FieldLabel className='mb-2'>{label}</FieldLabel>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant='outline'
                  className={cn(
                    'justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {field.value ? (
                    format(new Date(field.value), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              }
            />

            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) =>
                  field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                }
              />
            </PopoverContent>
          </Popover>
          {fieldError && <FieldError>{String(fieldError.message)}</FieldError>}
        </Field>
      )}
    />
  );
}
