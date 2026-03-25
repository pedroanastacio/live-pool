import { EventDispatcher } from './event-dispatcher';
import { VoteCastEventHandler } from './handlers';
import { VoteCastEvent } from './classes';

describe('Events', () => {
  it('should register an event', () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new VoteCastEventHandler();

    eventDispatcher.register(VoteCastEvent.name, eventHandler);

    expect(
      eventDispatcher.getEventHandlers.get(VoteCastEvent.name),
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers.get(VoteCastEvent.name),
    ).toHaveLength(1);
  });

  it('should notify when an event is dispatched', async () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new VoteCastEventHandler();
    const spyEventHandler = jest.spyOn(eventHandler, 'handle');

    eventDispatcher.register(VoteCastEvent.name, eventHandler);

    const event = new VoteCastEvent({ foo: 'bar' });

    await eventDispatcher.notify(event);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
