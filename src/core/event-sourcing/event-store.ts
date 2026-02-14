import { Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { RequestContext } from 'nestjs-request-context';

import { DomainEvent } from '@common/base/base.domain-event';
import { AggregateRoot, generateEntityId } from '@common/base/base.entity';

import { PrismaService } from '@shared/prisma/prisma.service';

import { IEventStore } from '@core/event-sourcing/event-store.interface';

@Injectable()
export class EventStore implements IEventStore {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  async storeAggregateEvents(
    aggregateRoot: AggregateRoot<unknown>,
  ): Promise<DomainEvent[]> {
    const events = aggregateRoot.getUncommittedEvents();
    if (events.length === 0) {
      return [];
    }

    const result = await this.txHost.tx.eventStore.findFirst({
      select: {
        version: true,
      },
      where: {
        aggregateId: BigInt(aggregateRoot.id),
      },
      orderBy: {
        id: 'desc',
      },
    });

    const version = result?.version || 0;

    await this.txHost.tx.eventStore.createMany({
      data: events.map((event, idx) => {
        return {
          id: BigInt(generateEntityId()),
          actorId:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            BigInt(RequestContext.currentContext?.req?.user?.id) || undefined,
          aggregate: events[0].aggregate,
          aggregateId: BigInt(event.aggregateId),
          eventName: event.eventName,
          eventPayload: event.eventPayload,
          version: version + idx + 1,
          occurredAt: event.occurredAt,
        };
      }),
    });

    return events;
  }
}
