// src/auth/auth.config.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { Transporter } from 'nodemailer';
import { createTransport } from 'nodemailer';
import { PrismaService } from '../prisma.service';

const prisma = new PrismaService();

const transporter: Transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  basePath: '/api/v1/auth',
  secret: process.env.BETTER_AUTH_SECRET || 'betterAuthSecret',
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'https://hoppscotch.io',
  ],
  advanced: {
    disableOriginCheck: true,
  },

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await transporter.sendMail({
        from: `"Nest Cart" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Reset Your Password',
        html: `<p>Hi ${user.name}, reset your password here: <a href="${url}">${url}</a></p>`,
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'CUSTOMER' },
      isActive: { type: 'boolean', defaultValue: true },
      isDelete: { type: 'boolean', defaultValue: false },
    },
  },
});
