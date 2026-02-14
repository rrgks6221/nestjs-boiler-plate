import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { DomainEvent } from '@common/base/base.domain-event';

import { EventPublisher } from '@core/event-publisher/event-publisher';
import { EVENT_PUBLISHER } from '@core/event-publisher/event-publisher.interface';
import { EventPublisherModule } from '@core/event-publisher/event-publisher.module';

describe(EventPublisher.name, () => {
  let eventPublisher: EventPublisher;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventPublisherModule],
    }).compile();

    eventPublisher = module.get<EventPublisher>(EVENT_PUBLISHER);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe(EventPublisher.prototype.publish.name, () => {
    beforeEach(() => {
      jest.spyOn(eventEmitter, 'emit').mockImplementation();
    });

    it('이벤트를 발행해야한다.', async () => {
      const event = {
        eventName: 'test.event',
        data: 'test data',
      } as unknown as DomainEvent;

      await expect(eventPublisher.publish(event)).resolves.toBeUndefined();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(eventEmitter.emit).toHaveBeenCalledWith(event.eventName, event);
    });
  });
});
