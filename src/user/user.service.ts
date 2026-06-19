import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
