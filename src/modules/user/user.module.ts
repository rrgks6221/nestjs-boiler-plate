import { Module } from '@nestjs/common';

import { CreateUserWithUsernameModule } from '@module/user/use-cases/create-user-with-username/create-user-with-username.module';
import { GetUserByUsernameModule } from '@module/user/use-cases/get-user-by-username/get-user-by-username.module';

@Module({
  imports: [CreateUserWithUsernameModule, GetUserByUsernameModule],
})
export class UserModule {}
