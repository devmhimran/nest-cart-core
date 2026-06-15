import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from '../../auth/auth.config';
import type {
  RequestWithAuth,
  AuthUser,
  AuthSession,
} from '../../auth/auth.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') {
        headers.set(key, value);
      }
    }

    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw new UnauthorizedException(
        'You must be logged in to view this resource.',
      );
    }

    request.user = session.user as AuthUser;
    request.session = session.session as AuthSession;

    return true;
  }
}
