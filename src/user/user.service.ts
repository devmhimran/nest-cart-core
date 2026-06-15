import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMeResponse(userId: string) {
    const baseUser = await this.prismaService.user.findUnique({
      where: { id: userId, isDelete: false, isActive: true },
    });

    if (!baseUser) return null;

    const sessionData = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        sessions: { select: { ipAddress: true, userAgent: true } },
      },
    });

    return {
      ...baseUser,
      authMetadata: {
        activeSessionsCount: sessionData?.sessions.length || 0,
      },
    };
  }
}
