import { auth } from './auth.config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
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
