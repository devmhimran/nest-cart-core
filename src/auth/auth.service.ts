// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from './auth.config';

@Injectable()
export class AuthService {
  /**
   * Helper utility to grab the session manually inside NestJS endpoints
   */
  async getSession(request: Request) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException('Session is invalid or expired');
    }

    return session;
  }
}
