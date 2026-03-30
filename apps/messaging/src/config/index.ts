import { Exchanges, IQueuesConfig } from '../types';

export const QUEUES: Record<string, IQueuesConfig> = {
  VOTE_CAST: {
    name: 'vote_cast',
    exchange: Exchanges.VOTES,
    routingKey: 'vote.cast',
  },
};
