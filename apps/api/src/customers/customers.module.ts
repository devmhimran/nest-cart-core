import { Module } from '@nestjs/common';

import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersController } from './customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, PrismaService],
})
export class CustomersModule {}
