import { Module } from '@nestjs/common';

import { AuthTokenService } from '@module/auth/services/auth-token/auth-token.service';
import { AUTH_TOKEN_SERVICE } from '@module/auth/services/auth-token/auth-token.service.interface';

@Module({
  providers: [
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: AuthTokenService,
    },
  ],
  exports: [AUTH_TOKEN_SERVICE],
})
export class AuthTokenModule {}
