import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { ConsumerService } from './services/consumer.service';
import { isPast } from 'date-fns';
import { PollStatus } from '@live-pool/database';

const IDEMPOTENCY_TTL = parseInt(process.env.IDEMPOTENCY_TTL ?? '86400');

export class WorkerApp {
  private db: DatabaseService;
  private redis: RedisService;
  private consumer: ConsumerService;

  constructor() {
    this.db = new DatabaseService();
    this.redis = new RedisService();
    this.consumer = new ConsumerService((data) => this.handleVote(data));
  }

  async start(): Promise<void> {
    console.log('Starting Worker...');
    await this.db.connect();
    await this.redis.connect();
    await this.consumer.connect();
    await this.consumer.startConsuming();
    console.log('Worker started and consuming messages...');
  }

  async stop(): Promise<void> {
    console.log('Shutting down Worker...');
    await this.consumer.close();
    await this.redis.disconnect();
    await this.db.disconnect();
    console.log('Worker stopped.');
  }

  private async handleVote(data: {
    pollId: string;
    pollOptionId: string;
    messageId?: string;
  }): Promise<void> {
    const { pollId, pollOptionId, messageId } = data;

    try {
      if (messageId) {
        const alreadyProcessed = await this.redis.exists(
          `processed:${messageId}`,
        );
        if (alreadyProcessed) {
          console.log(`Message ${messageId} already processed, skipping.`);
          return;
        }
      }

      const pollExists = await this.db.pollExists(pollId);
      if (!pollExists) {
        console.error(`Poll ${pollId} not found.`);
        return;
      }

      const poll = await this.db.findPollById(pollId);
      if (!poll) {
        console.error(`Poll ${pollId} not found.`);
        return;
      }

      if (poll.status !== PollStatus.ACTIVE) {
        console.error(`Poll ${pollId} is not active.`);
        return;
      }

      if (isPast(poll.expiresAt)) {
        console.error(`Poll ${pollId} has expired.`);
        return;
      }

      const optionBelongs = await this.db.optionBelongsToPoll(
        pollId,
        pollOptionId,
      );

      if (!optionBelongs) {
        console.error(
          `Option ${pollOptionId} does not belong to poll ${pollId}.`,
        );
        return;
      }

      const vote = await this.db.createVote(pollId, pollOptionId);

      const cacheKey = `vote_counts:${pollId}:${pollOptionId}`;
      await this.redis.increment(cacheKey);

      if (messageId) {
        await this.redis.setex(
          `processed:${messageId}`,
          IDEMPOTENCY_TTL,
          vote.id,
        );
      }

      console.log(`Vote ${vote.id} created for poll ${pollId}.`);
    } catch (error) {
      console.error('Error processing vote:', error);
    }
  }
}
