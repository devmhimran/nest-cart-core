import type { Request, Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, All, Req, Res, Inject } from '@nestjs/common';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  constructor(@Inject('BETTER_AUTH') private readonly auth: any) {}

  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const subPath = req.params[0] || '';
    req.url = `/api/v1/auth/${subPath}`;
    const { toNodeHandler } = await import('better-auth/node');
    return toNodeHandler(this.auth)(req, res);
  }
}
