import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { initializeAuth } from './auth.config';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: 'BETTER_AUTH',
      useFactory: async () => {
        return await initializeAuth();
      },
    },
  ],
  exports: [AuthService, 'BETTER_AUTH'],
})
export class AuthModule {}
