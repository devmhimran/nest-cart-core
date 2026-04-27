import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get()
  getAppStatus() {
    return {
      status: 'online ✅',
      message: 'NestSkeleton API is operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
