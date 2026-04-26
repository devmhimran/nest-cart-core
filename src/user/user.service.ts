import { SignUpDto } from './../auth/dto/signup.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '../../generated/prisma/enums';

export interface CreateUserSessionInput {
  id: string;
  userId: number;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user;
  }

  async findUserById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    return user;
  }

  async createCustomer(signUpDto: SignUpDto) {
    return this.prismaService.user.create({
      data: {
        name: signUpDto.name,
        email: signUpDto.email,
        password: signUpDto.password,
        role: UserRole.CUSTOMER,
      },
    });
  }

  async createUser(signUpDto: SignUpDto, role: UserRole) {
    return this.prismaService.user.create({
      data: {
        name: signUpDto.name,
        email: signUpDto.email,
        password: signUpDto.password,
        role,
      },
    });
  }

  async createUserSession(data: CreateUserSessionInput) {
    return this.prismaService.userSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        refreshToken: data.refreshToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  }

  async findUserSessionById(sessionId: string) {
    return this.prismaService.userSession.findUnique({
      where: { id: sessionId },
    });
  }

  async updateUserSessionRefreshToken(sessionId: string, refreshToken: string) {
    await this.prismaService.userSession.update({
      where: { id: sessionId },
      data: { refreshToken },
    });
  }

  async findUserSessionByUserId(userId: number) {
    return this.prismaService.userSession.findMany({
      where: { userId },
    });
  }

  async deleteUserSessionById(sessionId: string) {
    await this.prismaService.userSession.delete({
      where: { id: sessionId },
    });
  }
}
