import { Module } from '@nestjs/common';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';

@Module({
  imports: [ClsModuleFactory()],
  controllers: [],
  providers: [],
})
export class AppModule {}
