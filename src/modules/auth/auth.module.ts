import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthCookieService } from '@module/auth/services/auth-cookie.service';
import { AUTH_COOKIE_SERVICE } from '@module/auth/services/auth-cookie.service.interface';
import { AuthTokenService } from '@module/auth/services/auth-token.service';
import { AUTH_TOKEN_SERVICE } from '@module/auth/services/auth-token.service.interface';
import { LogoutController } from '@module/auth/use-cases/logout/logout.controller';
import { SignInWithUsernameController } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.controller';
import { SignInWithUsernameHandler } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.handler';
import { SignUpWithUsernameController } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.controller';
import { SignUpWithUsernameHandler } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.handler';
import { UserModule } from '@module/user/user.module';

import { ENV_KEY } from '@common/factories/config-module.factory';

import { EventStoreModule } from '@core/event-sourcing/event-store.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow(ENV_KEY.JWT_SECRET),
          signOptions: {
            issuer: configService.getOrThrow(ENV_KEY.JWT_ISSUER),
            audience: configService.getOrThrow(ENV_KEY.JWT_AUDIENCE),
          },
          verifyOptions: {
            issuer: configService.getOrThrow(ENV_KEY.JWT_ISSUER),
            audience: configService.getOrThrow(ENV_KEY.JWT_AUDIENCE),
          },
        };
      },
      inject: [ConfigService],
    }),
    EventStoreModule,
    UserModule,
  ],
  controllers: [
    LogoutController,
    SignUpWithUsernameController,
    SignInWithUsernameController,
  ],
  providers: [
    SignUpWithUsernameHandler,
    SignInWithUsernameHandler,
    {
      provide: AUTH_TOKEN_SERVICE,
      useClass: AuthTokenService,
    },
    {
      provide: AUTH_COOKIE_SERVICE,
      useClass: AuthCookieService,
    },
  ],
})
export class AuthModule {}
