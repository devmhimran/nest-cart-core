// src/auth/auth.controller.ts
import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.config';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('auth') // Matches /api/v1/auth
export class AuthController {
  @All('*')
  handleAuth(@Req() req: Request, @Res() res: Response) {
    // 1. Grab the wildcard path parameter (e.g., "sign-in/email")
    const subPath = req.params[0] || '';
    console.log({ tb: process.env.JWT_ACCESS_SECRET });
    // 2. Rewrite req.url so Better Auth sees its standard root layout structure
    req.url = `/api/auth/${subPath}`;

    // 3. Now the official node handler can read the path perfectly!
    return toNodeHandler(auth)(req, res);
  }
}
