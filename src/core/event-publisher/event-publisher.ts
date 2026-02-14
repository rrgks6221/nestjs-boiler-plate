import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainEvent } from '@common/base/base.domain-event';

import { IEventPublisher } from '@core/event-publisher/event-publisher.interface';

@Injectable()
export class EventPublisher implements IEventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish(event: DomainEvent): Promise<void> {
    this.eventEmitter.emit(event.eventName, event);

    this.logger.log(`Publishing event: ${event.eventName}`);

    return Promise.resolve();
  }
}
