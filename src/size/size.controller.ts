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
import { SizeService } from './size.service';
import { UserRole } from '../constants/enums';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser, RequestWithAuth } from '../auth/auth.interface';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('size')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  create(
    @Body() createSizeDto: CreateSizeDto,
    @Req() req: RequestWithAuth,
    @AuthCtx() user: AuthUser,
  ) {
    const userId = user?.id;
    console.log({ user });
    return this.sizeService.create(createSizeDto, userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: PaginationQueryDto, @AuthCtx() user: AuthUser) {
    console.log({ user });
    return this.sizeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSizeDto: UpdateSizeDto) {
    return this.sizeService.update(+id, updateSizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizeService.remove(+id);
  }
}
