import { Module } from '@nestjs/common';

import { UserModule } from '@module/user/user.module';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';

@Module({
  imports: [ClsModuleFactory(), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
