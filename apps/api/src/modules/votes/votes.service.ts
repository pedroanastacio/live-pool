import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, PollStatus } from '@live-pool/database';
import { EventDispatcher, VoteCastEvent } from '../../events';
import { isPast } from 'date-fns';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteResponseDto } from './dto';

@Injectable()
export class VotesService {
  constructor(
    private prisma: PrismaService,
    private eventDispatcher: EventDispatcher,
  ) {}

  async create(createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {
    await this.validateVoteData(
      createVoteDto.pollId,
      createVoteDto.pollOptionId,
    );

    const voteCastEvent = new VoteCastEvent(createVoteDto);
    await this.eventDispatcher.notify(voteCastEvent);

    return { message: 'Vote queued for processing' };
  }

  private async validateVoteData(
    pollId: string,
    pollOptionId: string,
  ): Promise<void> {
    await this.validatePollExists(pollId);
    await this.validatePollActive(pollId);
    await this.validateOptionBelongsToPoll(pollId, pollOptionId);
  }

  private async validatePollExists(pollId: string): Promise<void> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true },
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID "${pollId}" not found`);
    }
  }

  private async validatePollActive(pollId: string): Promise<void> {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID "${pollId}" not found`);
    }

    if (poll.status !== PollStatus.ACTIVE) {
      throw new BadRequestException(
        `Poll "${pollId}" is not active (status: ${poll.status})`,
      );
    }

    if (isPast(poll.expiresAt)) {
      throw new BadRequestException(`Poll "${pollId}" has expired`);
    }
  }

  private async validateOptionBelongsToPoll(
    pollId: string,
    pollOptionId: string,
  ): Promise<void> {
    const option = await this.prisma.pollOption.findFirst({
      where: { id: pollOptionId, pollId },
    });

    if (!option) {
      throw new BadRequestException(
        `Option "${pollOptionId}" does not belong to poll "${pollId}"`,
      );
    }
  }
}
