import { DynamicModule } from '@nestjs/common';

import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule } from 'nestjs-cls';

import { PrismaModule } from '@shared/prisma/prisma.module';
import { PRISMA_SERVICE } from '@shared/prisma/prisma.service';

export const ClsModuleFactory = (): DynamicModule => {
  return ClsModule.forRoot({
    plugins: [
      new ClsPluginTransactional({
        imports: [PrismaModule],
        adapter: new TransactionalAdapterPrisma({
          prismaInjectionToken: PRISMA_SERVICE,
        }),
      }),
    ],
    middleware: {
      mount: true,
      generateId: true,
    },
    global: true,
  });
};
