import { Module } from '@nestjs/common';

import { UserRepository } from '@module/user/repositories/user.repository';
import { USER_REPOSITORY } from '@module/user/repositories/user.repository.interface';
import { PasswordHasher } from '@module/user/services/password-hasher';
import { PASSWORD_HASHER } from '@module/user/services/password-hasher.interface';
import { CreateUserWithUsernameHandler } from '@module/user/use-cases/create-user-with-username/create-user-with-username.handler';
import { GetUserByUsernameHandler } from '@module/user/use-cases/get-user-by-username/get-user-by-username.handler';
import { GetUserController } from '@module/user/use-cases/get-user/get-user.controller';
import { GetUserHandler } from '@module/user/use-cases/get-user/get-user.handler';

@Module({
  controllers: [GetUserController],
  providers: [
    CreateUserWithUsernameHandler,
    GetUserByUsernameHandler,
    GetUserHandler,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasher,
    },
  ],
  exports: [PASSWORD_HASHER],
})
export class UserModule {}
