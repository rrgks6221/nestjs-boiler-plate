import { Test, TestingModule } from '@nestjs/testing';

import { DomainEvent } from '@common/base/base.domain-event';
import { AggregateRoot, generateEntityId } from '@common/base/base.entity';
import { ClsModuleFactory } from '@common/factories/cls-module.factory';

import { PRISMA_SERVICE, PrismaService } from '@shared/prisma/prisma.service';

import {
  EVENT_PUBLISHER,
  IEventPublisher,
} from '@core/event-publisher/event-publisher.interface';
import { EventStore } from '@core/event-sourcing/event-store';
import {
  EVENT_STORE,
  IEventStore,
} from '@core/event-sourcing/event-store.interface';
import { EventStoreModule } from '@core/event-sourcing/event-store.module';

class TestEvent extends DomainEvent {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  readonly aggregate = 'TEST' as unknown as any;
}

describe(EventStore.name, () => {
  let eventStore: IEventStore;
  let eventPublisher: IEventPublisher;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory(), EventStoreModule],
    }).compile();

    eventStore = module.get<IEventStore>(EVENT_STORE);
    eventPublisher = module.get<IEventPublisher>(EVENT_PUBLISHER);
    prismaService = module.get<PrismaService>(PRISMA_SERVICE);
  });

  describe(EventStore.prototype.storeAggregateEvents.name, () => {
    beforeEach(() => {
      jest.spyOn(eventPublisher, 'publish').mockResolvedValue();
    });

    describe('uncommitted events가 없는 경우', () => {
      it('빈 배열을 반환한다', async () => {
        const aggregateRoot = {
          id: 1,
          getUncommittedEvents: () => [],
          uncommit: jest.fn(),
        } as unknown as AggregateRoot<unknown>;

        const result = await eventStore.storeAggregateEvents(aggregateRoot);

        expect(result).toEqual([]);
        expect(aggregateRoot.uncommit).not.toHaveBeenCalled();
      });
    });

    describe('uncommitted events가 있는 경우', () => {
      it('이벤트를 저장하고 저장된 이벤트를 반환한다', async () => {
        const aggregateId = generateEntityId();
        const uncommittedEvents = [
          new TestEvent(aggregateId, {}),
          new TestEvent(aggregateId, {}),
        ];
        const aggregateRoot = {
          id: generateEntityId(),
          getUncommittedEvents: () => uncommittedEvents,
          uncommit: jest.fn(),
        } as unknown as AggregateRoot<unknown>;

        await expect(
          eventStore.storeAggregateEvents(aggregateRoot),
        ).resolves.toEqual(uncommittedEvents);
        await expect(
          prismaService.eventStore.findMany({
            where: { aggregateId: BigInt(aggregateId) },
          }),
        ).resolves.toSatisfyAll(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (event) => event.aggregateId === BigInt(aggregateId),
        );
        expect(eventPublisher.publish).toHaveBeenCalledTimes(
          uncommittedEvents.length,
        );
        expect(aggregateRoot.uncommit).toHaveBeenCalledTimes(1);
      });
    });
  });
});
