import * as amqp from 'amqplib';
import { MessageHandler, RetryOptions } from '../types';
import { RetryHandler } from './retry-handler';
import { DlqDecider } from './dlq-decider';

export class MessageProcessor {
  constructor(
    private readonly retryHandler: RetryHandler,
    private readonly dlqDecider: DlqDecider,
  ) {}

  async process(
    msg: amqp.ConsumeMessage,
    handler: MessageHandler,
    retryConfig: RetryOptions,
    channel: amqp.Channel,
  ): Promise<void> {
    const { maxAttempts, baseDelayMs, maxDelayMs } = retryConfig;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[CONSUMER] Processing message (attempt ${attempt}/${maxAttempts})`,
        );
        const content = JSON.parse(msg.content.toString()) as object;
        await handler(content);
        channel.ack(msg);
        console.log(`[CONSUMER] Message processed successfully, acknowledged`);
        return;
      } catch (error) {
        const shouldSendToDlq = this.dlqDecider.shouldSendToDlq(
          error,
          attempt,
          maxAttempts,
        );
        const errorMessage = this.dlqDecider.getErrorMessage(error);

        console.error(
          `[CONSUMER] Handler failed (attempt ${attempt}/${maxAttempts}): ${errorMessage}`,
        );

        if (shouldSendToDlq) {
          console.error(
            `[CONSUMER] [DLQ] Sending message to dead letter queue: ${errorMessage}`,
          );
          channel.nack(msg, false, false);
          return;
        }

        const shouldRetry = this.retryHandler.shouldRetry(attempt, maxAttempts);

        if (shouldRetry) {
          await this.retryHandler.executeRetry(
            attempt,
            maxAttempts,
            baseDelayMs,
            maxDelayMs,
          );
        }
      }
    }
  }
}
