import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? '';
const REDIS_OPTIONS = {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(REDIS_URL, REDIS_OPTIONS);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async increment(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }
}
