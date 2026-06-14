import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('test')
export class TestController {
  @Public()
  @Get('test1')
  getest1() {
    return { request: 'here is test1' };
  }
}
