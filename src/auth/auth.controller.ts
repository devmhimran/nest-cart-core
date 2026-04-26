import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import type { RequestWithAuth, ResponseWithCookie } from './auth.interface';
import { SignUpDto } from './dto/signup.dto';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @Public()
  signin(
    @Body() signinDto: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.signIn(signinDto, req, res);
    return response;
  }

  @Post('signup')
  @Public()
  signup(
    @Body() signupDto: SignUpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.signUp(signupDto, req, res);
    return response;
  }

  @Post('refresh')
  @Public()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const response = this.authService.refreshToken(req, res);
    return response;
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  getSessions(@Req() req: RequestWithAuth) {
    const user = req.user;
    return this.authService.listSessions(user?.id);
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard)
  deleteSession(@Req() req: RequestWithAuth, @Param('id') sessionId: string) {
    const user = req.user;
    const currentSessionId = user?.sid;

    return this.authService.deleteSession(
      user?.id,
      sessionId,
      currentSessionId,
    );
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  async signout(
    @Req() req: RequestWithAuth,
    @Res({ passthrough: true }) res: ResponseWithCookie,
  ) {
    const user = req.user;
    return this.authService.signOut(user?.sid, res);
  }
}
