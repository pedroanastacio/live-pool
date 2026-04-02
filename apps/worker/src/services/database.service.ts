import { PrismaClient, PrismaPg, Vote } from '@live-pool/database';

const DATABASE_URL = process.env.DATABASE_URL ?? '';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
    });
    this.prisma = new PrismaClient({ adapter });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  async createVote(pollId: string, pollOptionId: string): Promise<Vote> {
    return await this.prisma.vote.create({
      data: { pollId, pollOptionId },
    });
  }
}
