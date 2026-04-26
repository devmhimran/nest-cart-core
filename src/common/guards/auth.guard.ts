import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithAuth } from '../../auth/auth.interface';
import { Request } from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserService } from '../../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  private extractTokenFromHeader(request: RequestWithAuth): string | undefined {
    const authHeader = request.headers?.authorization;

    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = this.extractTokenFromHeader(request);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        role: UserRole;
        sid: string;
        iat?: number;
        exp?: number;
        [key: string]: any;
      }>(token);

      const session = await this.userService.findUserSessionById(payload.sid);
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      request.user = {
        id: payload.sub,
        ...payload,
      };
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
