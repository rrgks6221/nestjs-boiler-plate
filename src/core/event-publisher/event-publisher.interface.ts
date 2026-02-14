import { DomainEvent } from '@common/base/base.domain-event';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
