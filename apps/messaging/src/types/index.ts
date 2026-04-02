export enum Exchanges {
  VOTES = 'votes_exchange',
  DEAD_LETTER = 'dead_letter_exchange',
}

export interface IQueuesConfig {
  name: string;
  exchange: string;
  routingKey: string;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
}

export type MessageHandler = (message: object) => Promise<void>;

export interface IWorkerError {
  recoverable: boolean;
  message: string;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}
