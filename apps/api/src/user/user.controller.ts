import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AuthCtx } from './decorators/user.decorator';
import type { AuthUser, RequestWithAuth } from '../auth/auth.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../constants/enums';
import { UserQueryDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithAuth,
    @AuthCtx() user: AuthUser,
  ) {
    const userId = user?.id;
    return this.userService.createUser(createUserDto, userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @AuthCtx() user: AuthUser,
  ) {
    const userId = user?.id;
    return this.userService.updateUser(id, updateUserDto, userId);
  }
}
