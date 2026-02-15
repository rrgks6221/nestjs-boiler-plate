import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { LogDefinition } from 'generated/prisma/internal/prismaNamespace';

import { ENV_KEY } from '@common/factories/config-module.factory';

export const PRISMA_SERVICE = Symbol('PRISMA_SERVICE');

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env[ENV_KEY.DATABASE_URL],
    });
    const logOption: LogDefinition[] | undefined =
      process.env.NODE_ENV === 'test'
        ? undefined
        : [
            {
              emit: 'stdout',
              level: 'query',
            },
            {
              emit: 'stdout',
              level: 'error',
            },
            {
              emit: 'stdout',
              level: 'info',
            },
            {
              emit: 'stdout',
              level: 'warn',
            },
          ];

    super({ adapter, log: logOption });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
