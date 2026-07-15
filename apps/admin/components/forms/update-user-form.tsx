'use client';

import {
  Check,
  Eye,
  EyeClosed,
  Loader2,
  ShieldCheck,
  ShieldUser,
  UserCog,
  Users,
} from 'lucide-react';
import * as z from 'zod';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { UserRole } from '@/lib/enums';
import { UsersType } from '@/types/users';
import { requirements } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { getErrorMessage } from '@repo/ui/lib/utils';

const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters.' })
      .max(50, { message: 'Name must be less than 50 characters.' }),
    email: z.email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol')
      .optional()
      .or(z.literal('')),

    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm Password must be at least 6 characters.' })
      .max(100, {
        message: 'Confirm Password must be less than 100 characters.',
      })
      .optional()
      .or(z.literal('')),
    role: z.enum(UserRole, { message: 'Please select a role.' }),
    isActive: z.enum(['ACTIVE', 'INACTIVE'], {
      message: 'Please select a valid status',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

interface UpdateUserFormProps {
  data: UsersType | null;
  setIsOpen: (isOpen: boolean) => void;
}

const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const roleIcons: Record<UserRole, typeof ShieldCheck> = {
  [UserRole.SUPER_ADMIN]: ShieldCheck,
  [UserRole.ADMIN]: ShieldUser,
  [UserRole.MODERATOR]: UserCog,
  [UserRole.CUSTOMER]: Users,
};

export function UpdateUserForm({ data, setIsOpen }: UpdateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      isActive: data?.isActive ? 'ACTIVE' : 'INACTIVE',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data?.isActive ? 'ACTIVE' : 'INACTIVE',
      });
    }
  }, [data, reset]);

  const selectedRole = watch('role');
  const passwordValue = watch('password');

  function onSubmit(formData: UpdateUserFormValues) {
    if (!data?.id) return;

    setIsSubmitting(true);

    const { confirmPassword, ...rest } = formData;

    const payload = {
      id: data.id,
      ...rest,
      isActive: formData.isActive === 'ACTIVE',
    };

    if (payload.password === '') {
      delete payload.password;
    }

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
            <FieldLabel htmlFor='create-password'>Password</FieldLabel>
            <div className='relative'>
              <Input
                id='create-password'
                autoComplete='new-password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {showPassword ? (
                <span
                  className='absolute right-3 top-2.5 cursor-pointer'
                  onClick={() => setShowPassword(false)}
                >
                  <Eye className='w-4 h-4' />
                </span>
              ) : (
                <span
                  className='absolute right-3 top-2.5 cursor-pointer'
                  onClick={() => setShowPassword(true)}
                >
                  <EyeClosed className='w-4 h-4' />
                </span>
              )}
            </div>

            <div className='mt-3 space-y-1.5 text-xs text-muted-foreground transition-all duration-300'>
              <p className='font-medium text-foreground mb-2'>
                Password Requirements:
              </p>
              {requirements.map((req, index) => {
                const isMet = req.test(passwordValue);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 transition-colors duration-200 ${
                      isMet
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    {isMet ? (
                      <Check className='w-3.5 h-3.5 text-emerald-500 stroke-3' />
                    ) : (
                      <span className='w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 ml-1' />
                    )}
                    <span className={isMet ? 'line-through opacity-80' : ''}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <FieldError errors={[errors.password]} />
          </Field>
          <Field>
            <FieldLabel htmlFor='create-confirm-password'>
              Confirm Password
            </FieldLabel>
            <Input
              id='create-confirm-password'
              type='password'
              placeholder='Min. 6 characters'
              autoComplete='confirm-new-password'
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <FieldError>{errors.confirmPassword.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Controller
              name='isActive'
              control={control}
              render={({ field }) => (
                <Select
                  value={STATUS[field.value]}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select status...'></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {STATUS[key as keyof typeof STATUS]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
