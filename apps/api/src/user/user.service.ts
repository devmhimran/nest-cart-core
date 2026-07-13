import { Injectable } from '@nestjs/common';

import { UserQueryDto } from './dto/query-user.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination/paginate.util';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMeResponse(userId: string) {
    const baseUser = await this.prismaService.user.findUnique({
      where: { id: userId, isDelete: false, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            country: true,
            city: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!baseUser) return null;

    return {
      ...baseUser,
      activeSessions: baseUser.sessions.length,
    };
  }

  async findAll(query: UserQueryDto) {
    const { search, role } = query;
    const where: Prisma.UserWhereInput = {};

    where.role = {
      not: 3,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role !== undefined) {
      where.role = role;
    }

    return paginate(this.prismaService.user, query, {
      where,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }
}
