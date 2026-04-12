import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

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
