import { AmqpClient } from '../amqp-client';
import { Exchanges } from '../types';

export class Producer {
  private readonly amqpClient: AmqpClient;

  constructor(amqpClient: AmqpClient) {
    this.amqpClient = amqpClient;
  }

  async connect(url: string): Promise<void> {
    await this.amqpClient.connect(url);
    await this.amqpClient.setupExchanges();
  }

  publish(routingKey: string, message: object): boolean {
    const channel = this.amqpClient.getChannel();
    return channel.publish(
      Exchanges.VOTES,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async close(): Promise<void> {
    await this.amqpClient.close();
  }
}
