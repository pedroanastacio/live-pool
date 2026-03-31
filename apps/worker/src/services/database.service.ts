import { Poll, PrismaClient, PrismaPg, Vote } from '@live-pool/database';

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

  async pollExists(id: string): Promise<boolean> {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      select: { id: true },
    });

    return Boolean(poll);
  }

  async findPollById(id: string): Promise<Poll | null> {
    return await this.prisma.poll.findUnique({ where: { id } });
  }

  async optionBelongsToPoll(
    pollId: string,
    optionId: string,
  ): Promise<boolean> {
    const option = await this.prisma.pollOption.findFirst({
      where: { id: optionId, pollId },
    });

    return Boolean(option);
  }

  async createVote(pollId: string, pollOptionId: string): Promise<Vote> {
    return await this.prisma.vote.create({
      data: { pollId, pollOptionId },
    });
  }
}
