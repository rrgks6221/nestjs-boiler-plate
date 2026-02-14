import { Module } from '@nestjs/common';

import { AuthCookieModule } from '@module/auth/services/auth-cookie/auth-cookie.module';
import { AuthTokenModule } from '@module/auth/services/auth-token/auth-token.module';
import { SignInWithUsernameController } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.controller';
import { SignInWithUsernameHandler } from '@module/auth/use-cases/sign-in-with-username/sign-in-with-username.handler';
import { PasswordHasherModule } from '@module/user/services/password-hasher/password-hasher.module';

import { EventStoreModule } from '@core/event-sourcing/event-store.module';

@Module({
  imports: [
    AuthTokenModule,
    AuthCookieModule,
    PasswordHasherModule,
    EventStoreModule,
  ],
  controllers: [SignInWithUsernameController],
  providers: [SignInWithUsernameHandler],
})
export class SignInWithUsernameModule {}
