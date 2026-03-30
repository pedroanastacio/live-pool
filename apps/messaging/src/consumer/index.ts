import * as amqp from 'amqplib';
import { QUEUES } from '../config';
import { Exchanges, MessageHandler } from '../types';

export class Consumer {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(Exchanges.VOTES, 'direct', {
      durable: true,
    });
  }

  async consume(queueName: string, handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }

    const queue = Object.values(QUEUES).find((q) => q.name === queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found in QUEUES config`);
    }

    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, queue.exchange, queue.routingKey);

    await this.channel.consume(queueName, (msg: amqp.ConsumeMessage | null) => {
      if (msg) {
        void (async () => {
          try {
            const content = JSON.parse(msg.content.toString()) as object;
            await handler(content);
            this.channel?.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel?.nack(msg, false, false);
          }
        })();
      }
    });
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
