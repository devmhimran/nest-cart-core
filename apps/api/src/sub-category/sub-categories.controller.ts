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
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { UserRole } from '../constants/enums';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import type { AuthUser } from '../auth/auth.interface';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoryService: SubCategoriesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.subCategoryService.create(createSubCategoryDto, user?.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.subCategoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subCategoryService.findOne(+id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.subCategoryService.update(+id, updateSubCategoryDto, user?.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.subCategoryService.remove(+id, user?.id);
  }
}
