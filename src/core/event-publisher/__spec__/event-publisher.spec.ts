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
    it('이벤트를 발행해야한다.', async () => {
      jest.spyOn(eventEmitter, 'emitAsync').mockResolvedValue([]);
      const event = {
        eventName: 'test.event',
        data: 'test data',
      } as unknown as DomainEvent;

      await expect(eventPublisher.publish(event)).resolves.toBeUndefined();

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        event.eventName,
        event,
      );
    });

    it('이벤트 리스너 실패를 상위로 전파해야한다.', async () => {
      const event = {
        eventName: 'test.event',
        data: 'test data',
      } as unknown as DomainEvent;
      const listenerError = new Error('listener failed');

      jest.spyOn(eventEmitter, 'emitAsync').mockRejectedValue(listenerError);

      await expect(eventPublisher.publish(event)).rejects.toThrow(
        listenerError,
      );
    });
  });
});
