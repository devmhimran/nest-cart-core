import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, EntityType } from '../constants/enums';
import { paginate } from '../common/pagination/paginate.util';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { QueryPromoCodeDto } from './dto/query-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private prismaService: PrismaService) {}

  create(createPromoCodeDto: CreatePromoCodeDto, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const codeExists = await tx.promoCode.findUnique({
        where: { code: createPromoCodeDto.code },
      });

      if (codeExists) {
        throw new ConflictException(
          `Promo code '${createPromoCodeDto.code}' already exists.`,
        );
      }

      const start = new Date(createPromoCodeDto.startDate);
      const end = new Date(createPromoCodeDto.endDate);
      if (end <= start) {
        throw new BadRequestException('endDate must be after startDate');
      }

      const newPromoCode = await tx.promoCode.create({
        data: {
          code: createPromoCodeDto.code,
          title: createPromoCodeDto.title,
          amount: createPromoCodeDto.amount,
          startDate: start,
          endDate: end,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.PROMO_CODE,
          entityId: newPromoCode.id.toString(),
          newData: JSON.stringify(newPromoCode),
        },
      });
      return { message: 'Successfully created promo code', data: newPromoCode };
    });
  }

  findAll(query: QueryPromoCodeDto) {
    const { search, startDate, endDate, active } = query;

    const where: Prisma.PromoCodeWhereInput = {};

    const now = new Date();

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined && active !== null) {
      if (active) {
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else {
        where.OR = [
          ...(where.OR || []),
          { startDate: { gt: now } },
          { endDate: { lt: now } },
        ];
      }
    }

    if (startDate) {
      where.startDate = {
        ...(where.startDate as Prisma.DateTimeFilter),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.endDate = {
        ...(where.endDate as Prisma.DateTimeFilter),
        lte: new Date(endDate),
      };
    }

    return paginate(this.prismaService.promoCode, query, {
      where,
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const promoCode = await this.prismaService.promoCode.findUnique({
      where: { id },
    });
    if (!promoCode) {
      throw new NotFoundException(`Requested promo code not found.`);
    }
    return promoCode;
  }

  async update(
    id: number,
    updatePromoCodeDto: UpdatePromoCodeDto,
    userId?: string,
  ) {
    if (updatePromoCodeDto.code) {
      const codeExists = await this.prismaService.promoCode.findFirst({
        where: { code: updatePromoCodeDto.code, NOT: { id } },
      });

      if (codeExists) {
        throw new ConflictException(
          `Promo code '${updatePromoCodeDto.code}' already exists.`,
        );
      }
    }

    if (updatePromoCodeDto.startDate && updatePromoCodeDto.endDate) {
      const start = new Date(updatePromoCodeDto.startDate);
      const end = new Date(updatePromoCodeDto.endDate);
      if (end <= start) {
        throw new BadRequestException('endDate must be after startDate');
      }
    }

    return this.prismaService.$transaction(async (tx) => {
      const oldPromoCode = await tx.promoCode.findUnique({ where: { id } });

      if (!oldPromoCode)
        throw new NotFoundException(`Requested promo code not found.`);

      const data: Record<string, any> = {};
      if (updatePromoCodeDto.code !== undefined)
        data.code = updatePromoCodeDto.code;
      if (updatePromoCodeDto.title !== undefined)
        data.title = updatePromoCodeDto.title;
      if (updatePromoCodeDto.amount !== undefined)
        data.amount = updatePromoCodeDto.amount;
      if (updatePromoCodeDto.startDate !== undefined)
        data.startDate = new Date(updatePromoCodeDto.startDate);
      if (updatePromoCodeDto.endDate !== undefined)
        data.endDate = new Date(updatePromoCodeDto.endDate);

      const updatePromoCode = await tx.promoCode.update({
        where: { id },
        data,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.PROMO_CODE,
          entityId: updatePromoCode.id.toString(),
          oldData: JSON.stringify(oldPromoCode),
          newData: JSON.stringify(updatePromoCode),
        },
      });

      return {
        message: `Successfully updated promo code`,
        data: updatePromoCode,
      };
    });
  }

  remove(id: number, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const oldPromoCode = await tx.promoCode.findUnique({ where: { id } });
      if (!oldPromoCode)
        throw new NotFoundException(`Requested promo code not found.`);

      await tx.promoCode.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.PROMO_CODE,
          entityId: oldPromoCode.id.toString(),
          oldData: JSON.stringify(oldPromoCode),
        },
      });

      return { message: `Successfully deleted promo code` };
    });
  }
}
