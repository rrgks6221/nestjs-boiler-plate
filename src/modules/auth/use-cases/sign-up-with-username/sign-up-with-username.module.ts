import { Module } from '@nestjs/common';

import { AuthCookieModule } from '@module/auth/services/auth-cookie/auth-cookie.module';
import { AuthTokenModule } from '@module/auth/services/auth-token/auth-token.module';
import { SignUpWithUsernameController } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.controller';
import { SignUpWithUsernameHandler } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.handler';
import { CreateUserWithUsernameModule } from '@module/user/use-cases/create-user-with-username/create-user-with-username.module';

@Module({
  imports: [AuthTokenModule, AuthCookieModule, CreateUserWithUsernameModule],
  controllers: [SignUpWithUsernameController],
  providers: [SignUpWithUsernameHandler],
})
export class SignUpWithUsernameModule {}
