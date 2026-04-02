import { DatabaseService } from './services/database.service';
import { RedisService } from './services/redis.service';
import { ConsumerService } from './services/consumer.service';
import { Vote } from '@live-pool/database';
import { ValidationError, TransientError, ErrorCodes } from './errors';
import { VoteMessage } from './types';

const DEDUPLICATION_TTL = parseInt(process.env.DEDUPLICATION_TTL ?? '86400');

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

  private async handleVote(data: VoteMessage): Promise<void> {
    console.log(`[WORKER] Processing vote for poll ${data.pollId}`);
    await this.checkAlreadyProcessed(data.messageKey);
    const vote = await this.createVoteInDb(data.pollId, data.pollOptionId);
    await this.cacheVoteResult(
      data.pollId,
      data.pollOptionId,
      vote.id,
      data.messageKey,
    );
    console.log(
      `[WORKER] Vote ${vote.id} created successfully for poll ${data.pollId}`,
    );
  }

  private async checkAlreadyProcessed(messageKey: string): Promise<void> {
    const alreadyProcessed = await this.redis.exists(`processed:${messageKey}`);
    if (alreadyProcessed) {
      throw new ValidationError(
        `Message ${messageKey} already processed`,
        ErrorCodes.ALREADY_PROCESSED,
      );
    }
  }

  private async createVoteInDb(
    pollId: string,
    pollOptionId: string,
  ): Promise<Vote> {
    try {
      return await this.db.createVote(pollId, pollOptionId);
    } catch (error) {
      throw new TransientError(
        `Failed to create vote for poll ${pollId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async cacheVoteResult(
    pollId: string,
    pollOptionId: string,
    voteId: string,
    messageKey: string,
  ): Promise<void> {
    try {
      const cacheKey = `vote_counts:${pollId}:${pollOptionId}`;
      await this.redis.increment(cacheKey);

      await this.redis.setex(
        `processed:${messageKey}`,
        DEDUPLICATION_TTL,
        voteId,
      );
    } catch (error) {
      throw new TransientError(
        `Failed to cache vote result for poll ${pollId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
