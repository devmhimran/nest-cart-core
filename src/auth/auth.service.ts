import { SignInDto } from './dto/signin.dto';
import { Injectable } from '@nestjs/common';
import { TokenService } from './token/token.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    return { email, password, message: 'signin successfully' };
  }
  async signUp() {}
  async refreshToken() {}
}
