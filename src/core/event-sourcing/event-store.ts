import { Inject, Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsService } from 'nestjs-cls';

import { DomainEvent } from '@common/base/base.domain-event';
import {
  AggregateRoot,
  EntityId,
  generateEntityId,
} from '@common/base/base.entity';
import { InternalServerError } from '@common/base/base.error';
import { CLS_STORE_KEY } from '@common/constants/cls-store-key.constant';

import { PrismaService } from '@shared/prisma/prisma.service';

import {
  EVENT_PUBLISHER,
  IEventPublisher,
} from '@core/event-publisher/event-publisher.interface';
import { IEventStore } from '@core/event-sourcing/event-store.interface';

/**
 * @todo 현재 구현은 DB 트랜잭션 내부에서 이벤트를 즉시 발행합니다.
 *       따라서 이후 트랜잭션이 롤백되면, 외부 사이드이펙트(알림/프로젝션 등)가
 *       이미 실행된 상태가 될 수 있습니다.
 *       보일러플레이트 단순성을 위해 유지하되, 실서비스에서는 Outbox 패턴 또는
 *       commit 이후 발행 전략으로 대체해야합니다.
 */
@Injectable()
export class EventStore implements IEventStore {
  constructor(
    @InjectTransactionHost()
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    private readonly clsService: ClsService,
  ) {}

  async storeAggregateEvents(
    aggregateRoot: AggregateRoot<unknown>,
    actorId?: EntityId,
  ): Promise<DomainEvent[]> {
    const events: DomainEvent[] = aggregateRoot.getUncommittedEvents();
    if (events.length === 0) {
      return [];
    }

    const aggregateId = this.getAggregateId(events);
    const parsedActorId = this.parseActorId(actorId);

    await this.txHost.tx.$executeRaw`
      SELECT pg_advisory_xact_lock(${aggregateId})
    `;

    const result = await this.txHost.tx.eventStore.findFirst({
      select: {
        version: true,
      },
      where: {
        aggregateId,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const version = result?.version || 0;

    await this.txHost.tx.eventStore.createMany({
      data: events.map((event, idx) => {
        return {
          id: BigInt(generateEntityId()),
          actorId: parsedActorId,
          aggregate: events[0].aggregate,
          aggregateId,
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

    aggregateRoot.uncommit();

    return events;
  }

  private getAggregateId(events: DomainEvent[]): bigint {
    const firstAggregateId = events[0].aggregateId;
    const hasMismatchedAggregateId = events.some(
      (event) => event.aggregateId !== firstAggregateId,
    );

    if (hasMismatchedAggregateId) {
      throw new InternalServerError('all events must have same aggregateId');
    }

    return BigInt(firstAggregateId);
  }

  private parseActorId(actorId?: EntityId): bigint | undefined {
    const contextActorId = this.clsService.get<EntityId>(
      CLS_STORE_KEY.ACTOR_ID,
    );
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
