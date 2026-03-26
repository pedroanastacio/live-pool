import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { CreateVoteDto } from './dto/create-vote.dto';
import { EventDispatcher, VoteCastEvent } from '../../events';
import { VoteResponseDto } from './dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('votes')
export class VotesController {
  constructor(private readonly eventDispatcher: EventDispatcher) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: VoteResponseDto })
  async create(@Body() createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {
    const voteCastEvent = new VoteCastEvent(createVoteDto);
    await this.eventDispatcher.notify(voteCastEvent);

    return { message: 'Vote queued for processing' };
  }
}
