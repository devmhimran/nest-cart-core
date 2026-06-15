import { auth } from './auth.config';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, All, Req, Res } from '@nestjs/common';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  @All('*')
  handleAuth(@Req() req: Request, @Res() res: Response) {
    const subPath = req.params[0] || '';
    req.url = `/api/v1/auth/${subPath}`;
    return toNodeHandler(auth)(req, res);
  }
}
