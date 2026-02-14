import { Module } from '@nestjs/common';

import { CreateUserWithUsernameModule } from '@module/user/use-cases/create-user-with-username/create-user-with-username.module';
import { GetUserByUsernameModule } from '@module/user/use-cases/get-user-by-username/get-user-by-username.module';
import { GetUserModule } from '@module/user/use-cases/get-user/get-user.module';

@Module({
  imports: [
    CreateUserWithUsernameModule,
    GetUserByUsernameModule,
    GetUserModule,
  ],
})
export class UserModule {}
