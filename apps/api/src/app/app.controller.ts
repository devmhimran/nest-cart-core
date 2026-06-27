import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get()
  getAppStatus() {
    return {
      status: 'online ✅',
      message: 'NestSkeleton API is operational',
      timestamp: new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(new Date()),
      version: '1.0.0',
    };
  }
}
