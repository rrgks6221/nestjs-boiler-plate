import { Module } from '@nestjs/common';

import { AuthCookieService } from '@module/auth/services/auth-cookie/auth-cookie.service';
import { AUTH_COOKIE_SERVICE } from '@module/auth/services/auth-cookie/auth-cookie.service.interface';

@Module({
  providers: [
    {
      provide: AUTH_COOKIE_SERVICE,
      useClass: AuthCookieService,
    },
  ],
  exports: [AUTH_COOKIE_SERVICE],
})
export class AuthCookieModule {}
