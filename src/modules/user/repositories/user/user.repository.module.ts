import { Module } from '@nestjs/common';

import { UserRepository } from '@module/user/repositories/user/user.repository';
import { USER_REPOSITORY } from '@module/user/repositories/user/user.repository.interface';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UserRepositoryModule {}
