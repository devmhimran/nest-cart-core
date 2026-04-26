import { SignInDto } from './dto/signin.dto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from './token/token.service';
import { UserService } from '../user/user.service';
import type { ResponseWithCookie } from './auth.interface';
import { SignUpDto } from './dto/signup.dto';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { UserRole } from '../../generated/prisma/enums';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  private getCookieValue(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return null;
    }

    const cookie = cookieHeader
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`));

    if (!cookie) {
      return null;
    }

    return decodeURIComponent(cookie.slice(name.length + 1));
  }

  private async issueSessionTokens(
    userId: number,
    role: UserRole,
    req: Request,
    res: ResponseWithCookie,
  ) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipAddress =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0]?.trim() || req.ip
        : req.ip;
    const userAgent = req.headers['user-agent'];

    const sessionId = randomUUID();
    const { accessToken, refreshToken } = await this.tokenService.generateToken(
      userId,
      role,
      sessionId,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.createUserSession({
      id: sessionId,
      userId,
      refreshToken: hashedRefreshToken,
      ipAddress,
      userAgent,
    });

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return { accessToken };
  }

  async signIn(signInDto: SignInDto, req: Request, res: ResponseWithCookie) {
    const { email, password } = signInDto;
    const existingUser = await this.userService.findByEmail(email);
    if (!existingUser) {
      throw new ConflictException('Invalid email or password');
    }

    if (existingUser.isDelete) {
      throw new ConflictException('Account is inactive or deleted');
    }

    if (!existingUser.isActive) {
      throw new ConflictException('Account is inactive or deleted');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException('Invalid email or password');
    }

    const { accessToken } = await this.issueSessionTokens(
      existingUser.id,
      existingUser.role,
      req,
      res,
    );

    return { message: 'Signed in successfully', accessToken };
  }

  async signUp(signUpDto: SignUpDto, req: Request, res: ResponseWithCookie) {
    const existingUser = await this.userService.findByEmail(signUpDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(signUpDto.password, saltOrRounds);

    const signUpPayload = {
      ...signUpDto,
      password: hashPassword,
    };

    const user = await this.userService.createCustomer(signUpPayload);

    const { accessToken } = await this.issueSessionTokens(
      user.id,
      user.role,
      req,
      res,
    );

    return {
      message: 'signup successfully',
      accessToken,
    };
  }

  async refreshToken(req: Request, res: ResponseWithCookie) {
    const currentRefreshToken = this.getCookieValue(
      req.headers.cookie,
      'refreshToken',
    );

    if (!currentRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload =
      await this.tokenService.verifyRefreshToken(currentRefreshToken);

    const session = await this.userService.findUserSessionById(payload.sid);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token session');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      currentRefreshToken,
      session.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findUserById(payload.sub);
    if (!user || user.isDelete || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or deleted');
    }

    const { accessToken, refreshToken } = await this.tokenService.generateToken(
      user.id,
      user.role,
      session.id,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateUserSessionRefreshToken(
      session.id,
      hashedRefreshToken,
    );

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return {
      message: 'Token refreshed successfully',
      accessToken,
    };
  }

  async listSessions(userId?: number) {
    if (!userId) {
      throw new UnauthorizedException('User ID is required to list sessions');
    }
    return this.userService.findUserSessionByUserId(userId);
  }

  async deleteSession(
    userId?: number,
    sessionId?: string,
    currentSessionId?: string,
  ) {
    if (!sessionId) {
      throw new UnauthorizedException(
        'Session ID is required to delete session',
      );
    }

    if (sessionId === currentSessionId) {
      throw new ConflictException('Cannot remove current session');
    }

    const session = await this.userService.findUserSessionById(sessionId);
    if (!session || session.userId !== userId) {
      throw new UnauthorizedException(
        'Session not found or does not belong to user',
      );
    }
    await this.userService.deleteUserSessionById(sessionId);
    return { message: 'Session deleted successfully' };
  }

  async signOut(session: string | undefined, res: ResponseWithCookie) {
    if (!session) {
      throw new UnauthorizedException('No active session found');
    }
    await this.userService.deleteUserSessionById(session);

    res.cookie('refreshToken', '', {
      ...refreshTokenCookieOptions,
      maxAge: 0,
    });

    return { message: 'Signed out successfully' };
  }
}
