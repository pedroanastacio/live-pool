import { Module, Global, OnModuleInit } from '@nestjs/common';
import { EventDispatcher } from './event-dispatcher';
import { VoteCastEventHandler } from './handlers';
import { VoteCastEvent } from './classes';

@Global()
@Module({
  providers: [EventDispatcher, VoteCastEventHandler],
  exports: [EventDispatcher],
})
export class EventsModule implements OnModuleInit {
  constructor(
    private eventDispatcher: EventDispatcher,
    private voteCastEventHandler: VoteCastEventHandler,
  ) {}

  onModuleInit() {
    this.eventDispatcher.register(
      VoteCastEvent.name,
      this.voteCastEventHandler,
    );
  }
}
