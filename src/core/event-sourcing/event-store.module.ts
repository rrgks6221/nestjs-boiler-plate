import { Module } from '@nestjs/common';

import { EventPublisherModule } from '@core/event-publisher/event-publisher.module';
import { EventStore } from '@core/event-sourcing/event-store';
import { EVENT_STORE } from '@core/event-sourcing/event-store.interface';

@Module({
  imports: [EventPublisherModule],
  providers: [
    {
      provide: EVENT_STORE,
      useClass: EventStore,
    },
  ],
  exports: [EVENT_STORE],
})
export class EventStoreModule {}
