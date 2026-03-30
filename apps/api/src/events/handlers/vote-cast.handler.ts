import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler, IEvent } from '../types';
import { VoteCastEvent } from '../classes';
import { Producer, QUEUES } from '@live-pool/messaging';
import { PRODUCER_TOKEN } from '../../messaging/messaging.module';

@Injectable()
export class VoteCastEventHandler implements IEventHandler<IEvent> {
  constructor(@Inject(PRODUCER_TOKEN) private producer: Producer) {}

  handle(event: VoteCastEvent): void {
    this.producer.publish(QUEUES.VOTE_CAST.routingKey, event.data);
    console.log('VoteCastEventHandler: Message published to queue', event.data);
  }
}
