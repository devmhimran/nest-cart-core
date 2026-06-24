import { Controller, Get } from '@nestjs/common';
// import { Roles } from '../common/decorators/roles.decorator';
// import { UserRole } from '../../generated/prisma/enums';

@Controller('test')
export class TestController {
  // @Public()
  // @Roles(UserRole.SUPER_ADMIN)

  @Get('test1')
  getTest1() {
    return { request: 'here is test1' };
  }
}
