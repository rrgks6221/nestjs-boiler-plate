import { Module } from '@nestjs/common';

import { AuthCookieModule } from '@module/auth/services/auth-cookie/auth-cookie.module';
import { AuthTokenModule } from '@module/auth/services/auth-token/auth-token.module';
import { SignUpWithUsernameController } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.controller';
import { SignUpWithUsernameHandler } from '@module/auth/use-cases/sign-up-with-username/sign-up-with-username.handler';

import { EventStoreModule } from '@core/event-sourcing/event-store.module';

@Module({
  imports: [AuthTokenModule, AuthCookieModule, EventStoreModule],
  controllers: [SignUpWithUsernameController],
  providers: [SignUpWithUsernameHandler],
})
export class SignUpWithUsernameModule {}
