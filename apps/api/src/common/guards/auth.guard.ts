import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type {
  RequestWithAuth,
  AuthUser,
  AuthSession,
} from '../../auth/auth.interface';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
interface BetterAuthGuardInstance {
  api: {
    getSession: (options: { headers: Headers }) => Promise<{
      user: Record<string, unknown>;
      session: Record<string, unknown>;
    } | null>;
  };
}

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('BETTER_AUTH') private readonly auth: BetterAuthGuardInstance,
  ) {}

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

    const session = await this.auth.api.getSession({
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
