import { Controller, Get, Param, Patch, Query } from '@nestjs/common';

import { UserRole } from '../constants/enums';
import type { AuthUser } from '../auth/auth.interface';
import { CustomersService } from './customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { AuthCtx } from '../user/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @Get()
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('ban/:id')
  banned(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.customersService.banned(id, user?.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('inactive/:id')
  inactive(@Param('id') id: string, @AuthCtx() user: AuthUser) {
    return this.customersService.inactive(id, user?.id);
  }
}
