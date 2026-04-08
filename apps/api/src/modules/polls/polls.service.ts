import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, Poll } from '@live-pool/database';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import {
  PollResponseDto,
  PollDeleteResponseDto,
} from './dto/poll-response.dto';
import { PollsQueryDto } from './dto/polls-query.dto';
import { parseISO, startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) {}

  async create(createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const { options, ...pollData } = createPollDto;

    return await this.prisma.poll.create({
      data: {
        ...pollData,
        expiresAt: new Date(pollData.expiresAt),
        options: {
          create: options.map((option) => ({
            description: option.description,
            ordeIndex: option.orderIndex,
          })),
        },
      },
      include: {
        options: {
          orderBy: {
            ordeIndex: 'asc',
          },
        },
      },
    });
  }

  async findAll(query: PollsQueryDto): Promise<PollResponseDto[]> {
    const {
      search,
      status,
      expiresBefore,
      expiresAfter,
      expiresAt,
      sortBy,
      order,
    } = query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (expiresBefore) {
      where.expiresAt = {
        ...(where.expiresAt as object),
        lt: new Date(expiresBefore),
      };
    }

    if (expiresAfter) {
      where.expiresAt = {
        ...(where.expiresAt as object),
        gt: new Date(expiresAfter),
      };
    }

    if (expiresAt) {
      const parsedDate = parseISO(expiresAt);
      where.expiresAt = {
        gte: startOfDay(parsedDate),
        lte: endOfDay(parsedDate),
      };
    }

    const orderBy: Record<string, string> = {};
    if (sortBy) {
      orderBy[sortBy] = order || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return await this.prisma.poll.findMany({
      where,
      orderBy,
      include: {
        options: {
          orderBy: {
            ordeIndex: 'asc',
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<PollResponseDto> {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            ordeIndex: 'asc',
          },
        },
      },
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID "${id}" not found`);
    }

    return poll;
  }

  async update(
    id: string,
    updatePollDto: UpdatePollDto,
  ): Promise<PollResponseDto> {
    const poll = await this.prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      throw new NotFoundException(`Poll with ID "${id}" not found`);
    }

    const data: Partial<Poll> = {
      title: updatePollDto.title,
      description: updatePollDto.description,
      status: updatePollDto.status,
      expiresAt: updatePollDto.expiresAt
        ? new Date(updatePollDto.expiresAt)
        : undefined,
    };

    return await this.prisma.poll.update({
      where: { id },
      data,
      include: {
        options: {
          orderBy: {
            ordeIndex: 'asc',
          },
        },
      },
    });
  }

  async remove(id: string): Promise<PollDeleteResponseDto> {
    const poll = await this.prisma.poll.findUnique({ where: { id } });

    if (!poll) {
      throw new NotFoundException(`Poll with ID "${id}" not found`);
    }

    await this.prisma.poll.delete({
      where: { id },
    });

    return { message: `Poll with ID "${id}" deleted successfully` };
  }
}
