import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, scrypt } from 'node:crypto';

import { UserQueryDto } from './dto/query-user.dto';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination/paginate.util';
import { CreateUserDto } from './dto/create-user.dto';
import { authPromise } from '../auth/auth.config';
import { AuditAction, EntityType, UserStatusInput } from '../constants/enums';
import { UpdateUserDto } from './dto/update-user.dto';

const scryptConfig = { N: 16384, r: 16, p: 1, dkLen: 64 };

function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      scryptConfig.dkLen,
      {
        N: scryptConfig.N,
        r: scryptConfig.r,
        p: scryptConfig.p,
        maxmem: 128 * scryptConfig.N * scryptConfig.r * 2,
      },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      },
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString('hex')}`;
}
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
    const { search, role, status } = query;
    const where: Prisma.UserWhereInput = {
      isDelete: false,
      role: {
        not: 3,
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
    if (role !== undefined) {
      where.role = role;
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
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  async createUser(dto: CreateUserDto, userId?: string) {
    const auth = await authPromise;

    return this.prismaService.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: {
          OR: [
            { email: dto.email },
            ...(dto.phone ? [{ phone: dto.phone }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === dto.email) {
          throw new BadRequestException('Email already exists.');
        }
        throw new BadRequestException('Phone number already exists.');
      }

      const createdAuthUser = await auth.api.signUpEmail({
        body: {
          email: dto.email,
          password: dto.password,
          name: dto.name,
        },
      });

      if (!createdAuthUser || !createdAuthUser.user) {
        throw new BadRequestException(
          'Failed to build credentials via Auth API.',
        );
      }

      const updatedUser = await tx.user.update({
        where: { id: createdAuthUser.user.id },
        data: {
          role: dto.role,
          phone: dto.phone || null,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.CREATE,
          entity: EntityType.USER,
          entityId: updatedUser.id,
          newData: JSON.stringify(updatedUser),
        },
      });

      return {
        message: 'Successfully created user',
        data: {
          name: dto.name,
          email: dto.email,
        },
      };
    });
  }

  async updateUser(id: string, dto: UpdateUserDto, userId?: string) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    if (dto.email || dto.phone) {
      const conflictingUser = await this.prismaService.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.phone ? [{ phone: dto.phone }] : []),
          ],
        },
      });
      if (conflictingUser) {
        throw new BadRequestException(
          'Email or phone number is already occupied by another user.',
        );
      }
    }

    if (dto.password && dto.password.trim() !== '') {
      try {
        const hashedPassword = await hashPassword(dto.password);

        const existingAccount = await this.prismaService.account.findFirst({
          where: { userId: id, providerId: 'credential' },
        });

        if (existingAccount) {
          await this.prismaService.account.update({
            where: { id: existingAccount.id },
            data: { password: hashedPassword },
          });
        } else {
          await this.prismaService.account.create({
            data: {
              userId: id,
              providerId: 'credential',
              accountId: id,
              password: hashedPassword,
            },
          });
        }
      } catch (authError: unknown) {
        const errorMessage =
          authError instanceof Error
            ? authError.message
            : 'An unknown authentication error occurred';

        throw new BadRequestException(
          `Failed to update user password: ${errorMessage}`,
        );
      }
    }

    return this.prismaService.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          name: dto.name,
          email: dto.email,
          role: dto.role,
          phone: dto.phone,
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
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
        message: 'Successfully updated user',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
        },
      };
    });
  }

  async removeUser(id: string, userId?: string) {
    return this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException('User profile not found.');
      }

      await tx.user.update({
        where: { id },
        data: { isDelete: true },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: AuditAction.DELETE,
          entity: EntityType.USER,
          entityId: user.id,
          oldData: JSON.stringify(user),
        },
      });
    });
  }
}
