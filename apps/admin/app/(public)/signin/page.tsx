'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from '@repo/ui';
import { z } from 'zod';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';

const loginSchema = z.object({
  email: z
    .email({ error: 'Please enter a valid email address' })
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previousURL = searchParams.get('callbackUrl');

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    const loginAction = async () => {
      const res = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        throw new Error(res.error.message || 'Invalid email or password!');
      }

      return res;
    };

    toast.promise(loginAction(), {
      loading: 'Logging you in...',
      success: () => {
        router.push(previousURL ?? '/dashboard');
        return 'Welcome back! Redirecting...';
      },
      error: (err) => {
        return err.message || 'Login failed. Please check your credentials.';
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='h-screen flex items-center justify-center'>
        <Card className='w-full max-w-sm'>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input
                    id='email'
                    autoComplete='off'
                    // type='email'
                    placeholder='m@example.com'
                    {...register('email')}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>
                  <Input
                    id='password'
                    autoComplete='off'
                    type='password'
                    placeholder='••••••••'
                    {...register('password')}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
          <CardFooter className='flex-col gap-2'>
            <Button type='submit' className='w-full'>
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
