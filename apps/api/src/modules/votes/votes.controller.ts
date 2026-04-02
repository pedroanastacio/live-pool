import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { CreateVoteDto } from './dto/create-vote.dto';
import { VotesService } from './votes.service';
import { VoteResponseDto } from './dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: VoteResponseDto })
  create(@Body() createVoteDto: CreateVoteDto): Promise<VoteResponseDto> {
    return this.votesService.create(createVoteDto);
  }
}
