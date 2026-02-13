import { Module } from '@nestjs/common';

import { UserRepositoryModule } from '@module/user/repositories/user/user.repository.module';
import { GetUserByUsernameHandler } from '@module/user/use-cases/get-user-by-username/get-user-by-username.handler';

@Module({
  imports: [UserRepositoryModule],
  providers: [GetUserByUsernameHandler],
  exports: [GetUserByUsernameHandler],
})
export class GetUserByUsernameModule {}
