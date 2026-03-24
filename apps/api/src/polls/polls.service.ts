import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, PollStatus } from '@live-pool/database';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import {
  PollResponseDto,
  PollDeleteResponseDto,
} from './dto/poll-response.dto';

type PollUpdateData = {
  title?: string;
  description?: string | null;
  status?: PollStatus;
  expires_at?: Date;
};

@Injectable()
export class PollsService {
  constructor(private prisma: PrismaService) {}

  async create(createPollDto: CreatePollDto): Promise<PollResponseDto> {
    const { options, ...pollData } = createPollDto;

    return await this.prisma.poll.create({
      data: {
        ...pollData,
        expires_at: new Date(pollData.expires_at),
        options: {
          create: options.map((option) => ({
            description: option.description,
            order_index: option.order_index,
          })),
        },
      },
      include: {
        options: {
          orderBy: {
            order_index: 'asc',
          },
        },
      },
    });
  }

  async findAll(): Promise<PollResponseDto[]> {
    return await this.prisma.poll.findMany({
      include: {
        options: {
          orderBy: {
            order_index: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<PollResponseDto> {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            order_index: 'asc',
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

    const data: PollUpdateData = {
      title: updatePollDto.title,
      description: updatePollDto.description,
      status: updatePollDto.status,
      expires_at: updatePollDto.expires_at
        ? new Date(updatePollDto.expires_at)
        : undefined,
    };

    return await this.prisma.poll.update({
      where: { id },
      data,
      include: {
        options: {
          orderBy: {
            order_index: 'asc',
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
