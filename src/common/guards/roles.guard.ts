// src/auth/role.guard.ts
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
    // 1. Get the required roles from the route handler metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required on this endpoint, let the request through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Grab the request object
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithAuth>();

    const user = request.user; // Populated by BetterAuthGuard

    // Safety check: If BetterAuthGuard wasn't applied, user won't exist
    if (!user) {
      throw new ForbiddenException(
        'User context not found. Ensure BetterAuthGuard is applied.',
      );
    }

    // 3. Check if the user's role matches any of the allowed roles
    const hasRole = user.role ? requiredRoles.includes(user.role) : false;

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return true;
  }
}
