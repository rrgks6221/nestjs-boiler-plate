import { Global, Module } from '@nestjs/common';

import { EventStore } from '@core/event-sourcing/event-store';
import { EVENT_STORE } from '@core/event-sourcing/event-store.interface';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_STORE,
      useClass: EventStore,
    },
  ],
  exports: [EVENT_STORE],
})
export class EventStoreModule {}
