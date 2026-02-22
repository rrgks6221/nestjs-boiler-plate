import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainEvent } from '@common/base/base.domain-event';

import { IEventPublisher } from '@core/event-publisher/event-publisher.interface';

@Injectable()
export class EventPublisher implements IEventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(event.eventName, event);
      this.logger.log(`Published event: ${event.eventName}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventName}`);
      throw error;
    }
  }
}
