export enum Exchanges {
  VOTES = 'votes_exchange',
}

export interface IQueuesConfig {
  name: string;
  exchange: string;
  routingKey: string;
}

export type MessageHandler = (message: object) => Promise<void>;
