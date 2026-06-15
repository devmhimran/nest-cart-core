import { UserService } from './user.service';
import { Controller, Get } from '@nestjs/common';
import { AuthCtx } from './decorators/user.decorator';
import type { AuthUser } from '../auth/auth.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@AuthCtx() user: AuthUser) {
    return await this.userService.getMeResponse(user.id);
  }
}
