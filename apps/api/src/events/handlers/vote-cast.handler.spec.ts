/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { VoteCastEventHandler } from './vote-cast.handler';
import { VoteCastEvent } from '../classes';
import { PRODUCER_TOKEN } from '../../messaging/messaging.module';
import { QUEUES } from '@live-pool/messaging';
import { CreateVoteDto } from 'src/modules/votes/dto';

describe('VoteCastEventHandler', () => {
  let handler: VoteCastEventHandler;
  let mockProducer: { publish: jest.Mock };
  const voteData: CreateVoteDto = {
    pollId: 'test-poll-id',
    pollOptionId: 'test-option-id',
  };

  beforeEach(async () => {
    mockProducer = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteCastEventHandler,
        {
          provide: PRODUCER_TOKEN,
          useValue: mockProducer,
        },
      ],
    }).compile();

    handler = module.get<VoteCastEventHandler>(VoteCastEventHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should publish message to VOTE_CAST queue when event is handled', () => {
    const event = new VoteCastEvent(voteData);

    handler.handle(event);

    expect(mockProducer.publish).toHaveBeenCalledWith(
      QUEUES.VOTE_CAST.routingKey,
      voteData,
    );
  });

  it('should publish correct message structure', () => {
    const event = new VoteCastEvent(voteData);

    handler.handle(event);

    const [[routingKey, message]] = mockProducer.publish.mock.calls;
    expect(routingKey).toBe(QUEUES.VOTE_CAST.routingKey);
    expect(message).toEqual(voteData);
  });
});
