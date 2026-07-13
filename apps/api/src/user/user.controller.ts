import { UserService } from './user.service';
import { Controller, Get, Post, Query } from '@nestjs/common';
import { AuthCtx } from './decorators/user.decorator';
import type { AuthUser } from '../auth/auth.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../constants/enums';
import { UserQueryDto } from './dto/query-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@AuthCtx() user: AuthUser) {
    return await this.userService.getMeResponse(user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }
}
