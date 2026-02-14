import { DomainEvent } from '@common/base/base.domain-event';
import { AggregateRoot, EntityId } from '@common/base/base.entity';

export const EVENT_STORE = Symbol('EVENT_STORE');

export interface IEventStore {
  storeAggregateEvents(
    aggregateRoot: AggregateRoot<unknown>,
    actorId?: EntityId,
  ): Promise<DomainEvent[]>;
}
