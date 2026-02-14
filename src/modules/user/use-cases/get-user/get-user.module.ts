import { Module } from '@nestjs/common';

import { UserRepositoryModule } from '@module/user/repositories/user/user.repository.module';
import { GetUserController } from '@module/user/use-cases/get-user/get-user.controller';
import { GetUserHandler } from '@module/user/use-cases/get-user/get-user.handler';

@Module({
  imports: [UserRepositoryModule],
  controllers: [GetUserController],
  providers: [GetUserHandler],
})
export class GetUserModule {}
