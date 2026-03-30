import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler, IEvent } from '../types';
import { VoteCastEvent } from '../classes';
import { Producer, QUEUES } from '@live-pool/messaging';
import { PRODUCER_TOKEN } from '../../messaging/messaging.module';
import { CreateVoteDto } from 'src/modules/votes/dto';

@Injectable()
export class VoteCastEventHandler implements IEventHandler<IEvent> {
  constructor(@Inject(PRODUCER_TOKEN) private producer: Producer) {}

  handle(event: VoteCastEvent): void {
    const voteData = event.data as CreateVoteDto;

    const message = {
      pollId: voteData.pollId,
      pollOptionId: voteData.pollOptionId,
    };

    this.producer.publish(QUEUES.VOTE_CAST.routingKey, message);
    console.log('VoteCastEventHandler: Message published to queue', message);
  }
}
