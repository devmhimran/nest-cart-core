import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { SizesModule } from '../sizes/sizes.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { TestController } from '../test/test.controller';
import { RoleGuard } from '../common/guards/roles.guard';
import { BetterAuthGuard } from '../common/guards/auth.guard';
import { CategoriesModule } from '../categories/categories.module';
import { SubCategoriesModule } from '../sub-category/sub-categories.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    SizesModule,
    CategoriesModule,
    SubCategoriesModule,
    PrismaModule,
  ],
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
