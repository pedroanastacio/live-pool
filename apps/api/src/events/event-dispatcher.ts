import { IEventDispatcher, IEventHandler, IEvent } from './types';

export class EventDispatcher implements IEventDispatcher {
  private eventHandlers: Map<string, IEventHandler[]> = new Map();

  get getEventHandlers(): Map<string, IEventHandler[]> {
    return this.eventHandlers;
  }

  register(eventName: string, handler: IEventHandler): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }

    this.eventHandlers.get(eventName)?.push(handler);
  }

  async notify<T extends IEvent = IEvent>(event: T): Promise<void> {
    const handlers = this.eventHandlers.get(event.constructor.name);

    if (!handlers || handlers.length === 0) {
      return;
    }

    await Promise.allSettled(
      handlers.map(async (handler) => await handler.handle(event)),
    );
  }
}
