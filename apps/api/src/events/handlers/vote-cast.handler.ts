import { IEventHandler, IEvent } from '../types';
import { VoteCastEvent } from '../classes';

export class VoteCastEventHandler implements IEventHandler<IEvent> {
  async handle(event: VoteCastEvent): Promise<void> {
    console.log('VoteCastEventHandler', event);
    return Promise.resolve();
  }
}
