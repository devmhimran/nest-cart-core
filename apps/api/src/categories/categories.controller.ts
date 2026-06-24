import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from '../constants/enums';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../auth/auth.interface';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.categoryService.create(createCategoryDto, user?.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.categoryService.update(+id, updateCategoryDto, user?.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.categoryService.remove(+id, user?.id);
  }
}
