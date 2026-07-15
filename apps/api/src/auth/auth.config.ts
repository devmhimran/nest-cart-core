import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Auth, BetterAuthOptions } from 'better-auth';
import { validateOrReject, ValidationError } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

import { admin } from 'better-auth/plugins';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from '../prisma/prisma.service';

const prisma = new PrismaService();
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const transporter: Transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const productionOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(',')
  : [];

const localOrigins = [
  process.env.LOCAL_ORIGIN || 'http://localhost:5173',
  'https://hoppscotch.io/',
];

async function validateBody<T extends object>(
  dtoClass: ClassConstructor<T>,
  body: Record<string, unknown>,
  APIError: (typeof import('better-auth'))['APIError'],
): Promise<void> {
  try {
    const dataInstance = plainToInstance(dtoClass, body);
    await validateOrReject(dataInstance);
  } catch (error: unknown) {
    if (
      Array.isArray(error) &&
      error.every((e) => e instanceof ValidationError)
    ) {
      const errorMessages = error.flatMap((err) =>
        err.constraints ? Object.values(err.constraints) : [],
      );

      throw new APIError('BAD_REQUEST', {
        message: errorMessages.join(', '),
      });
    }

    throw new APIError('INTERNAL_SERVER_ERROR', {
      message: 'An unexpected error occurred during validation.',
    });
  }
}

export async function initializeAuth(): Promise<Auth> {
  const { betterAuth, APIError } = await import('better-auth');
  const { prismaAdapter } = await import('better-auth/adapters/prisma');

  const options: BetterAuthOptions = {
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: '/api/v1/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: isDev ? localOrigins : productionOrigins,

    advanced: {
      disableOriginCheck: isDev,
      disableCSRFCheck: isDev,
    },

    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),

    hooks: {
      before: async (ctx) => {
        const requestUrl = ctx.request?.url;
        if (!requestUrl) return { context: ctx };

        const urlPath = requestUrl.startsWith('http')
          ? new URL(requestUrl).pathname
          : requestUrl;

        if (!ctx.body) return { context: ctx };

        const body = ctx.body as Record<string, unknown>;

        if (urlPath.endsWith('/sign-up/email')) {
          if (body.role !== undefined && body.role !== 3) {
            throw new APIError('BAD_REQUEST', {
              message: 'Registration is restricted to the default role only.',
            });
          }
          await validateBody(SignUpDto, body, APIError);
        }

        if (urlPath.endsWith('/sign-in/email')) {
          await validateBody(SignInDto, body, APIError);

          const email = typeof body.email === 'string' ? body.email : undefined;

          if (email) {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              if (user.isDelete) {
                throw new APIError('FORBIDDEN', {
                  message: 'This account has been removed.',
                });
              }

              if (!user.isActive) {
                throw new APIError('FORBIDDEN', {
                  message: 'This account is currently inactive.',
                });
              }
            }
          }
        }

        return { context: ctx };
      },
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        const cleanUrl = url.split('?')[0];
        const token = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
        const frontendResetUrl = `${process.env.PASSWORD_RESET_URL}?token=${token}`;

        await transporter.sendMail({
          from: `"Nest Cart" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: 'Reset Your Password',
          html: `<p>Hi ${user.name}, reset your password here: <a href="${frontendResetUrl}">${frontendResetUrl}</a></p>`,
        });
      },
    },
    user: {
      additionalFields: {
        customRole: {
          type: 'number',
          defaultValue: 3,
          input: false,
          fieldName: 'role',
        },
      },
    },
    plugins: [admin()],
  };

  return betterAuth(options);
}

export const authPromise = initializeAuth();
