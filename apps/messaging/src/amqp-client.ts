import * as amqp from 'amqplib';
import { Exchanges, IQueuesConfig } from './types';

const DLQ_SUFFIX = '_dlq';

export class AmqpClient {
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  async connect(url: string): Promise<void> {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
  }

  getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }
    return this.channel;
  }

  async setupExchanges(): Promise<void> {
    await this.channel?.assertExchange(Exchanges.VOTES, 'direct', {
      durable: true,
    });

    await this.channel?.assertExchange(Exchanges.DEAD_LETTER, 'direct', {
      durable: true,
    });
  }

  async setupDeadLetterQueues(
    queueConfig: Record<string, IQueuesConfig>,
  ): Promise<void> {
    for (const queue of Object.values(queueConfig)) {
      if (queue.name.includes(DLQ_SUFFIX)) {
        await this.channel?.assertQueue(queue.name, { durable: true });
        await this.channel?.bindQueue(
          queue.name,
          queue.exchange,
          queue.routingKey,
        );
      }
    }
  }

  async setupQueue(
    channel: amqp.Channel,
    queueName: string,
    config: IQueuesConfig,
  ): Promise<void> {
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': config.deadLetterExchange,
        'x-dead-letter-routing-key': config.deadLetterRoutingKey,
      },
    });
    await channel.bindQueue(queueName, config.exchange, config.routingKey);
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
