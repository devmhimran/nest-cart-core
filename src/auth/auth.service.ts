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
    res: ResponseWithCookie,
  ) {
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
    });

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    return { accessToken };
  }

  async signIn(signInDto: SignInDto, res: ResponseWithCookie) {
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
      res,
    );

    return { message: 'Signed in successfully', accessToken };
  }

  async signUp(signUpDto: SignUpDto, res: ResponseWithCookie) {
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
}
