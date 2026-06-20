import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserRole } from '../constants/enums';
import { ColorsService } from './colors.service';
import type { AuthUser } from '../auth/auth.interface';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('colors')
export class ColorsController {
  constructor(private readonly colorsService: ColorsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(@Body() createColorDto: CreateColorDto, @AuthCtx() user: AuthUser) {
    return this.colorsService.create(createColorDto, user?.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.colorsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colorsService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColorDto: UpdateColorDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.colorsService.update(id, updateColorDto, user?.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @AuthCtx() user: AuthUser) {
    return this.colorsService.remove(id, user?.id);
  }
}
