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
import { UserRole } from '../constants/enums';
import { ProductsService } from './products.service';
import type { AuthUser } from '../auth/auth.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.productsService.create(createProductDto, user?.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.productsService.update(+id, updateProductDto, user?.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.productsService.remove(+id, user?.id);
  }
}
