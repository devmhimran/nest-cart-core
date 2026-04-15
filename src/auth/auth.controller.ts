import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signin(@Body() signinDto: SignInDto) {
    const result = this.authService.signIn(signinDto);
    return {
      result,
    };
  }
}
