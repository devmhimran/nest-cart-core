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
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { UserRole } from '../constants/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthCtx } from '../user/decorators/user.decorator';
import type { AuthUser } from '../auth/auth.interface';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  create(
    @Body() createPromoCodeDto: CreatePromoCodeDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.promoCodesService.create(createPromoCodeDto, user?.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.promoCodesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promoCodesService.findOne(id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
    @AuthCtx() user: AuthUser,
  ) {
    return this.promoCodesService.update(id, updatePromoCodeDto, user?.id);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @AuthCtx() user: AuthUser) {
    return this.promoCodesService.remove(id, user?.id);
  }
}
