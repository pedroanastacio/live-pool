import { Consumer, QUEUES, AmqpClient } from '@live-pool/messaging';
import { VoteMessage } from 'src/types';

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? '';

export class ConsumerService {
  private consumer: Consumer;

  constructor(private readonly handler: (data: VoteMessage) => Promise<void>) {
    const amqpClient = new AmqpClient();
    this.consumer = new Consumer(amqpClient);
  }

  async connect(): Promise<void> {
    await this.consumer.connect(RABBITMQ_URL ?? '');
  }

  async startConsuming(): Promise<void> {
    await this.consumer.consume(
      QUEUES.VOTE_CAST.name,
      async (message: object) => {
        const data = message as unknown as VoteMessage;
        await this.handler(data);
      },
    );
  }

  async close(): Promise<void> {
    await this.consumer.close();
  }
}
