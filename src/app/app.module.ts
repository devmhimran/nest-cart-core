import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { SizeModule } from '../size/size.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { TestController } from '../test/test.controller';
import { RoleGuard } from '../common/guards/roles.guard';
import { BetterAuthGuard } from '../common/guards/auth.guard';

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
