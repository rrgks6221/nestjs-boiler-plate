import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { EventPublisher } from '@core/event-publisher/event-publisher';
import { EVENT_PUBLISHER } from '@core/event-publisher/event-publisher.interface';

@Module({
  imports: [EventEmitterModule.forRoot({})],
  providers: [
    {
      provide: EVENT_PUBLISHER,
      useClass: EventPublisher,
    },
  ],
  exports: [EVENT_PUBLISHER],
})
export class EventPublisherModule {}
