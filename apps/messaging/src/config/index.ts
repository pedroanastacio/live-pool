import { Exchanges, IQueuesConfig } from '../types';

export const QUEUES: Record<string, IQueuesConfig> = {
  VOTE_CAST: {
    name: 'vote_cast',
    exchange: Exchanges.VOTES,
    routingKey: 'vote.cast',
    deadLetterExchange: Exchanges.DEAD_LETTER,
    deadLetterRoutingKey: 'vote_cast.dlq',
  },
  VOTE_CAST_DLQ: {
    name: 'vote_cast_dlq',
    exchange: Exchanges.DEAD_LETTER,
    routingKey: 'vote_cast.dlq',
  },
};

export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};
