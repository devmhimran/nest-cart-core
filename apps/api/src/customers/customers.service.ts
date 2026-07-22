import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { paginate } from '../common/pagination/paginate.util';
import { AuditAction, EntityType, UserStatusInput } from '../constants/enums';

@Injectable()
export class CustomersService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(query: CustomerQueryDto) {
    const { search, status } = query;

    const where: Prisma.UserWhereInput = {
      isDelete: false,
      role: {
        notIn: [0, 1, 2],
      },
    };

    if (status !== undefined) {
      where.isActive = status === UserStatusInput.ACTIVE;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return paginate(this.prismaService.user, query, {
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        banned: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  banned(id: string, userId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          banned: !user.banned,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.USER,
          entityId: updatedUser.id,
          newData: JSON.stringify(updatedUser),
        },
      });
      return {
        message: `User ${updatedUser.name} has been ${updatedUser.banned ? 'unbanned' : 'banned'}.`,
      };
    });
  }

  inactive(id: string, userId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          isActive: !user.isActive,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.UPDATE,
          entity: EntityType.USER,
          entityId: updatedUser.id,
          newData: JSON.stringify(updatedUser),
        },
      });
      return {
        message: `User ${updatedUser.name} has been ${updatedUser.banned ? 'Inactive' : 'active'}.`,
      };
    });
  }
}
