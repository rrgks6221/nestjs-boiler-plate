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
    super({
      adapter: new PrismaPg({
        connectionString: process.env[ENV_KEY.DATABASE_URL],
      }),
      log: PrismaService.buildLogOption(process.env[ENV_KEY.NODE_ENV]),
    });
  }

  private static buildLogOption(nodeEnv?: string): LogDefinition[] | undefined {
    if (nodeEnv === 'test') {
      return;
    }

    const levels: LogDefinition['level'][] =
      nodeEnv === 'development'
        ? ['query', 'error', 'info', 'warn']
        : ['error', 'warn'];

    return levels.map((level) => ({
      emit: 'stdout',
      level,
    }));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
