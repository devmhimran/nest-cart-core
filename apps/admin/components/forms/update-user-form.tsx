'use client';

import * as z from 'zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
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
import { UsersType } from '@/types/users';
import { getErrorMessage } from '@repo/ui/lib/utils';
import { UserRole } from '@/lib/enums';
import { ROLE_LABELS } from '@/lib/constants';

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must be less than 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  role: z.nativeEnum(UserRole, { message: 'Please select a role.' }),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UpdateUserFormProps {
  data: UsersType | null;
  setIsOpen: (isOpen: boolean) => void;
}

const roleIcons: Record<UserRole, typeof ShieldCheck> = {
  [UserRole.SUPER_ADMIN]: ShieldCheck,
  [UserRole.ADMIN]: ShieldUser,
  [UserRole.MODERATOR]: UserCog,
  [UserRole.CUSTOMER]: Users,
};

export function UpdateUserForm({ data, setIsOpen }: UpdateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUserAsync } = useUsers();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      role: data?.role ?? undefined,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        email: data.email,
        role: data.role,
      });
    }
  }, [data, reset]);

  const selectedRole = watch('role');

  function onSubmit(formData: UpdateUserFormValues) {
    if (!data?.id) return;

    setIsSubmitting(true);
    const payload = { id: data.id, ...formData };

    toast.promise(updateUserAsync(payload), {
      loading: 'Updating user...',
      success: () => {
        setIsSubmitting(false);
        setIsOpen(false);
        return 'User updated successfully';
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
            <FieldLabel htmlFor='update-name'>Name</FieldLabel>
            <Input
              id='update-name'
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
            <FieldLabel htmlFor='update-email'>Email</FieldLabel>
            <Input
              id='update-email'
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
                Update the permissions for this user.
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
          Update User
        </Button>
      </div>
    </form>
  );
}
