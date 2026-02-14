import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { SignInWithUsernameModule } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.module';
import { SignUpWithUsernameModule } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.module';

import { ENV_KEY } from '@common/factories/config-module.factory';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow(ENV_KEY.JWT_SECRET),
          signOptions: {
            issuer: configService.getOrThrow(ENV_KEY.JWT_ISSUER),
          },
        };
      },
      inject: [ConfigService],
    }),
    SignUpWithUsernameModule,
    SignInWithUsernameModule,
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
