import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  // @Public()

  @Get('test1')
  getTest1() {
    return { request: 'here is test1' };
  }
}
