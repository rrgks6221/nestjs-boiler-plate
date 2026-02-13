import { Module } from '@nestjs/common';

import { PasswordHasher } from '@module/user/services/password-hasher/password-hasher';
import { PASSWORD_HASHER } from '@module/user/services/password-hasher/password-hasher.interface';

@Module({
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasher,
    },
  ],
  exports: [PASSWORD_HASHER],
})
export class PasswordHasherModule {}
