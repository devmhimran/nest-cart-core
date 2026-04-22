import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import type { ResponseWithCookie } from './auth.interface';
import { SignUpDto } from './dto/signup.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(
    @Body() signinDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.signIn(signinDto, req, res);
    return response;
  }

  @Post('signup')
  signup(
    @Body() signupDto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.signUp(signupDto, req, res);
    return response;
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.refreshToken(req, res);
    return response;
  }
}
