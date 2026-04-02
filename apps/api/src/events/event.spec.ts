import { EventDispatcher } from './event-dispatcher';
import { VoteCastEventHandler } from './handlers';
import { VoteCastEvent } from './classes';
import { Producer } from '@live-pool/messaging';

describe('Events', () => {
  let mockProducer: {
    publish: jest.Mock;
  };

  beforeAll(() => {
    mockProducer = {
      publish: jest.fn(),
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should register an event', () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new VoteCastEventHandler(
      mockProducer as unknown as Producer,
    );

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
    const eventHandler = new VoteCastEventHandler(
      mockProducer as unknown as Producer,
    );
    const spyEventHandler = jest.spyOn(eventHandler, 'handle');

    eventDispatcher.register(VoteCastEvent.name, eventHandler);

    const event = new VoteCastEvent({
      pollId: 'test-poll-id',
      pollOptionId: 'test-option-id',
      messageKey: 'test-message-key',
    });

    await eventDispatcher.notify(event);

    expect(spyEventHandler).toHaveBeenCalled();
  });
});
