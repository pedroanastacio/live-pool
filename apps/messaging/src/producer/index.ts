import * as amqp from 'amqplib';
import { Exchanges } from '../types';

export class Producer {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(Exchanges.VOTES, 'direct', {
      durable: true,
    });
  }

  publish(routingKey: string, message: object): boolean {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    return this.channel.publish(
      Exchanges.VOTES,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}
