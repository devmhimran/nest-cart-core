import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestWithAuth } from '../../auth/auth.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithAuth>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'User context not found. Ensure BetterAuthGuard is applied.',
      );
    }

    const hasRole = user.role ? requiredRoles.includes(user.role) : false;

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
