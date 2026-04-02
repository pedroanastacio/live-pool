import * as amqp from 'amqplib';
import { QUEUES, RETRY_CONFIG } from '../config';
import { IQueuesConfig, MessageHandler, RetryOptions } from '../types';
import { AmqpClient } from '../amqp-client';
import { RetryHandler } from './retry-handler';
import { DlqDecider } from './dlq-decider';
import { MessageProcessor } from './message-processor';

export class Consumer {
  private readonly amqpClient: AmqpClient;
  private readonly retryHandler: RetryHandler;
  private readonly dlqDecider: DlqDecider;
  private readonly messageProcessor: MessageProcessor;
  private readonly queueConfig: Record<string, IQueuesConfig>;
  private readonly retryConfigDefault: typeof RETRY_CONFIG;

  constructor(
    amqpClient: AmqpClient,
    queueConfig: Record<string, IQueuesConfig> = QUEUES,
    retryConfigDefault: typeof RETRY_CONFIG = RETRY_CONFIG,
  ) {
    this.amqpClient = amqpClient;
    this.queueConfig = queueConfig;
    this.retryConfigDefault = retryConfigDefault;
    this.retryHandler = new RetryHandler();
    this.dlqDecider = new DlqDecider();
    this.messageProcessor = new MessageProcessor(
      this.retryHandler,
      this.dlqDecider,
    );
  }

  async connect(url: string): Promise<void> {
    await this.amqpClient.connect(url);
    await this.amqpClient.setupExchanges();
    await this.amqpClient.setupDeadLetterQueues(this.queueConfig);
  }

  async consume(
    queueName: string,
    handler: MessageHandler,
    retryOptions?: Partial<RetryOptions>,
  ): Promise<void> {
    const queue = Object.values(this.queueConfig).find(
      (q) => q.name === queueName,
    );

    if (!queue) {
      throw new Error(`Queue ${queueName} not found in QUEUES config`);
    }

    const channel = this.amqpClient.getChannel();
    await this.amqpClient.setupQueue(channel, queueName, queue);

    const retryConfig = this.createRetryConfig(retryOptions);

    await channel.consume(queueName, (msg: amqp.ConsumeMessage | null) => {
      if (!msg) return;
      void this.messageProcessor.process(msg, handler, retryConfig, channel);
    });
  }

  async close(): Promise<void> {
    await this.amqpClient.close();
  }

  private createRetryConfig(
    retryOptions?: Partial<RetryOptions>,
  ): RetryOptions {
    return {
      maxAttempts:
        retryOptions?.maxAttempts ?? this.retryConfigDefault.maxAttempts,
      baseDelayMs:
        retryOptions?.baseDelayMs ?? this.retryConfigDefault.baseDelayMs,
      maxDelayMs:
        retryOptions?.maxDelayMs ?? this.retryConfigDefault.maxDelayMs,
    };
  }
}
