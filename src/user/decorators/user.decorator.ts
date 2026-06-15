import { RequestWithAuth } from '../../auth/auth.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();

    return request.user;
  },
);
