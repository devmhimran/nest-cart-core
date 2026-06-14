import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TestController } from './test/test.controller';
import { APP_GUARD } from '@nestjs/core';

import { SizeModule } from './size/size.module';
import { BetterAuthGuard } from './common/guards/auth.guard';
import { RoleGuard } from './common/guards/roles.guard';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, SizeModule],
  controllers: [AppController, TestController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: BetterAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
