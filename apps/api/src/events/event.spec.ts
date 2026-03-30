import { EventDispatcher } from './event-dispatcher';
import { VoteCastEventHandler } from './handlers';
import { VoteCastEvent } from './classes';

describe('Events', () => {
  let mockProducer: {
    publish: jest.Mock;
    connect: jest.Mock;
    close: jest.Mock;
  };

  beforeAll(() => {
    mockProducer = {
      publish: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should register an event', () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new VoteCastEventHandler(mockProducer);

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
    const eventHandler = new VoteCastEventHandler(mockProducer);
    const spyEventHandler = jest.spyOn(eventHandler, 'handle');

    eventDispatcher.register(VoteCastEvent.name, eventHandler);

    const event = new VoteCastEvent({
      pollId: 'test-poll-id',
      pollOptionId: 'test-option-id',
    });

    await eventDispatcher.notify(event);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
