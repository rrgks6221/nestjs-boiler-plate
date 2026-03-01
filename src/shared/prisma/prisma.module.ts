import { Global, Module } from '@nestjs/common';

import { PRISMA_SERVICE, PrismaService } from '@shared/prisma/prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PRISMA_SERVICE,
      useClass: PrismaService,
    },
  ],
  exports: [PRISMA_SERVICE],
})
export class PrismaModule {}
