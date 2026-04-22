import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserRole } from '../../../generated/prisma/enums';
import { jwtConstants } from '../constants';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(userId: number, role: UserRole, sessionId: string) {
    const payload = { sub: userId, role, sid: sessionId };
    const accessOption: JwtSignOptions = {
      secret: jwtConstants.accessSecret,
      expiresIn: '45m' as const,
    } as JwtSignOptions;

    const refreshOption: JwtSignOptions = {
      secret: jwtConstants.refreshSecret,
      expiresIn: '7d' as const,
    };

    const accessToken = await this.jwtService.signAsync(payload, accessOption);
    const refreshToken = await this.jwtService.signAsync(
      payload,
      refreshOption,
    );
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<{
    sub: number;
    role: UserRole;
    sid: string;
  }> {
    return this.jwtService.verifyAsync<{
      sub: number;
      role: UserRole;
      sid: string;
    }>(token, {
      secret: jwtConstants.refreshSecret,
    });
  }
}
