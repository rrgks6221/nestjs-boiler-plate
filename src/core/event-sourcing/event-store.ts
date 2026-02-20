import { Inject, Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { RequestContext } from 'nestjs-request-context';

import { DomainEvent } from '@common/base/base.domain-event';
import {
  AggregateRoot,
  EntityId,
  generateEntityId,
} from '@common/base/base.entity';

import { PrismaService } from '@shared/prisma/prisma.service';

import {
  EVENT_PUBLISHER,
  IEventPublisher,
} from '@core/event-publisher/event-publisher.interface';
import { IEventStore } from '@core/event-sourcing/event-store.interface';

@Injectable()
export class EventStore implements IEventStore {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
  ) {}

  async storeAggregateEvents(
    aggregateRoot: AggregateRoot<unknown>,
    actorId?: EntityId,
  ): Promise<DomainEvent[]> {
    const events: DomainEvent[] = aggregateRoot.getUncommittedEvents();
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
          actorId: this.parseActorId(actorId),
          aggregate: events[0].aggregate,
          aggregateId: BigInt(event.aggregateId),
          eventName: event.eventName,
          eventPayload: event.eventPayload,
          version: version + idx + 1,
          occurredAt: event.occurredAt,
        };
      }),
    });

    await Promise.all(
      events.map((event) => this.eventPublisher.publish(event)),
    );

    return events;
  }

  private parseActorId(actorId?: EntityId): bigint | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const contextActorId: EntityId =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      RequestContext.currentContext?.req?.user?.id;
    const rawActorId = actorId ?? contextActorId;

    if (rawActorId === undefined || rawActorId === null) {
      return;
    }

    const actorIdString = String(rawActorId).trim();
    if (!/^\d+$/.test(actorIdString)) {
      return;
    }

    return BigInt(actorIdString);
  }
}
