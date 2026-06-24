import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { SizesService } from './sizes.service';
import { UserRole } from '../constants/enums';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser, RequestWithAuth } from '../auth/auth.interface';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('sizes')
export class SizesController {
  constructor(private readonly sizeService: SizesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(
    @Body() createSizeDto: CreateSizeDto,
    @Req() req: RequestWithAuth,
    @AuthCtx() user: AuthUser,
  ) {
    const userId = user?.id;
    return this.sizeService.create(createSizeDto, userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.sizeService.findAll(query);
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.sizeService.findOne(name);
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() updateSizeDto: UpdateSizeDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.sizeService.update(name, updateSizeDto, user?.id);
  }

  @Delete(':name')
  remove(@Param('name') name: string, @AuthCtx() user: AuthUser) {
    return this.sizeService.remove(name, user?.id);
  }
}
