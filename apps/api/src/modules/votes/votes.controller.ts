import { Controller, Post, Body, HttpCode } from '@nestjs/common';

import { CreateVoteDto } from './dto/create-vote.dto';
import { EventDispatcher, VoteCastEvent } from '../../events';

@Controller('votes')
export class VotesController {
  constructor(private readonly eventDispatcher: EventDispatcher) {}

  @Post()
  @HttpCode(200)
  async create(
    @Body() createVoteDto: CreateVoteDto,
  ): Promise<{ message: string }> {
    const voteCastEvent = new VoteCastEvent(createVoteDto);
    await this.eventDispatcher.notify(voteCastEvent);

    return { message: 'Vote queued for processing' };
  }
}
