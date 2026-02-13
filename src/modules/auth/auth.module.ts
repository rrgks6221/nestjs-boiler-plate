import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SignUpWithUsernameModule } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            issuer: process.env.JWT_ISSUER,
          },
        };
      },
    }),
    SignUpWithUsernameModule,
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
