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

  async findUserById(id: string) {
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
}
