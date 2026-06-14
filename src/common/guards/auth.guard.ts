// src/auth/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '../../auth/auth.config';
import type {
  RequestWithAuth,
  AuthUser,
  AuthSession,
} from '../../auth/auth.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // ⚡ Bypasses authentication safely!
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      }
    }

    // Better Auth looks at cookies or Authorization headers automatically
    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw new UnauthorizedException(
        'You must be logged in to view this resource.',
      );
    }

    // Attach the session and user metadata to the request for your controllers to use
    request.user = session.user as AuthUser;
    request.session = session.session as AuthSession;

    return true;
  }
}
