import { Module } from '@nestjs/common';

import { UserReadRepository } from '@module/user/repositories/user.read-repository';
import { USER_READ_REPOSITORY } from '@module/user/repositories/user.read-repository.interface';
import { UserWriteRepository } from '@module/user/repositories/user.write-repository';
import { USER_WRITE_REPOSITORY } from '@module/user/repositories/user.write-repository.interface';
import { PasswordHasher } from '@module/user/services/password-hasher';
import { PASSWORD_HASHER } from '@module/user/services/password-hasher.interface';
import { CreateUserWithUsernameHandler } from '@module/user/use-cases/create-user-with-username/create-user-with-username.handler';
import { GetUserController } from '@module/user/use-cases/get-user/get-user.controller';
import { GetUserHandler } from '@module/user/use-cases/get-user/get-user.handler';

@Module({
  controllers: [GetUserController],
  providers: [
    CreateUserWithUsernameHandler,
    GetUserHandler,
    {
      provide: USER_WRITE_REPOSITORY,
      useClass: UserWriteRepository,
    },
    {
      provide: USER_READ_REPOSITORY,
      useClass: UserReadRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasher,
    },
  ],
  exports: [PASSWORD_HASHER, USER_WRITE_REPOSITORY],
})
export class UserModule {}
