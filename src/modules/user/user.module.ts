import { Module } from '@nestjs/common';

import { CreateUserWithUsernameModule } from '@module/user/use-cases/create-user-with-username/create-user-with-username.module';

@Module({
  imports: [CreateUserWithUsernameModule],
})
export class UserModule {}
