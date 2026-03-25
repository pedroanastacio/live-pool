import { IEvent } from './event.type';

export interface IEventHandler<T extends IEvent = IEvent> {
  handle(event: T): Promise<void> | void;
}
