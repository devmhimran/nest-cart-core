import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ColorsController],
  providers: [ColorsService, PrismaService],
})
export class ColorsModule {}
