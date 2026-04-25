import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('test')
@UseGuards()
export class TestController {
  @Public()
  @Get('test1')
  getest1() {
    return { request: 'here is test1' };
  }
}
