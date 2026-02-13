import { Module } from '@nestjs/common';

import { UserRepositoryModule } from '@module/user/repositories/user/user.repository.module';
import { PasswordHasherModule } from '@module/user/services/password-hasher/password-hasher.module';
import { CreateUserWithUsernameHandler } from '@module/user/use-cases/create-user-with-username/create-user-with-username.handler';

@Module({
  imports: [UserRepositoryModule, PasswordHasherModule],
  providers: [CreateUserWithUsernameHandler],
})
export class CreateUserWithUsernameModule {}
