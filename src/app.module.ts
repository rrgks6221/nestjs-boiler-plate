import { Module } from '@nestjs/common';

import { AuthModule } from '@module/auth/auth.module';
import { UserModule } from '@module/user/user.module';

import { ClsModuleFactory } from '@common/factories/cls-module.factory';
import { ConfigModuleFactory } from '@common/factories/config-module.factory';

import { PrismaModule } from '@shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModuleFactory(),
    PrismaModule,
    ClsModuleFactory(),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
