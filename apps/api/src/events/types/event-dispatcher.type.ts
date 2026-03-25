import { IEventHandler, IEvent } from '.';

export interface IEventDispatcher {
  register(eventName: string, handler: IEventHandler): void;
  notify(event: IEvent): Promise<void>;
}
