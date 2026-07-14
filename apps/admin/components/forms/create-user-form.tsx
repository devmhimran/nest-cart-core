'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, ShieldCheck, ShieldUser, UserCog, Users } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useUsers } from '@/hooks';
import { getErrorMessage } from '@repo/ui/lib/utils';
import { UserRole } from '@/lib/enums';
import { ROLE_LABELS } from '@/lib/constants';

const createUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must be less than 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .max(100, { message: 'Password must be less than 100 characters.' }),
  role: z.nativeEnum(UserRole, { message: 'Please select a role.' }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  setIsOpen: (isOpen: boolean) => void;
}

const roleIcons: Record<UserRole, typeof ShieldCheck> = {
  [UserRole.SUPER_ADMIN]: ShieldCheck,
  [UserRole.ADMIN]: ShieldUser,
  [UserRole.MODERATOR]: UserCog,
  [UserRole.CUSTOMER]: Users,
};

export function CreateUserForm({ setIsOpen }: CreateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUserAsync } = useUsers();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
    },
  });

  const selectedRole = watch('role');

  function onSubmit(data: CreateUserFormValues) {
    setIsSubmitting(true);
    toast.promise(createUserAsync(data), {
      loading: 'Creating user...',
      success: () => {
        setIsSubmitting(false);
        reset();
        setIsOpen(false);
        return 'User created successfully';
      },
      error: (err) => {
        setIsSubmitting(false);
        return getErrorMessage(err);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-2'>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='create-name'>Name</FieldLabel>
            <Input
              id='create-name'
              placeholder='e.g., John Doe'
              autoComplete='off'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name ? (
              <FieldError>{errors.name.message}</FieldError>
            ) : (
              <FieldDescription>The full name of the user.</FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='create-email'>Email</FieldLabel>
            <Input
              id='create-email'
              type='email'
              placeholder='e.g., john@example.com'
              autoComplete='off'
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email ? (
              <FieldError>{errors.email.message}</FieldError>
            ) : (
              <FieldDescription>
                The email address for sign in.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor='create-password'>Password</FieldLabel>
            <Input
              id='create-password'
              type='password'
              placeholder='Min. 6 characters'
              autoComplete='new-password'
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password ? (
              <FieldError>{errors.password.message}</FieldError>
            ) : (
              <FieldDescription>
                The initial password for the user.
              </FieldDescription>
            )}
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <Controller
              name='role'
              control={control}
              render={({ field }) => (
                <Select
                  value={
                    field.value !== undefined ? String(field.value) : undefined
                  }
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a role...'>
                      {selectedRole !== undefined
                        ? ROLE_LABELS[selectedRole]
                        : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([key, label]) => {
                      const roleValue = Number(key) as UserRole;
                      const Icon = roleIcons[roleValue];
                      return (
                        <SelectItem key={key} value={key}>
                          <div className='flex items-center gap-2'>
                            <Icon className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role ? (
              <FieldError>{errors.role.message}</FieldError>
            ) : (
              <FieldDescription>
                Determine the permissions for this user.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className='flex items-center justify-end gap-3 pt-4 border-t'>
        <Button
          type='button'
          variant='outline'
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Save User
        </Button>
      </div>
    </form>
  );
}
