import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import {
  PollResponseDto,
  PollDeleteResponseDto,
} from './dto/poll-response.dto';
import { Poll } from '@live-pool/database';
import { ApiResponse } from '@nestjs/swagger';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: PollResponseDto })
  create(@Body() createPollDto: CreatePollDto): Promise<Poll> {
    return this.pollsService.create(createPollDto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: PollResponseDto, isArray: true })
  findAll(): Promise<PollResponseDto[]> {
    return this.pollsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: PollResponseDto })
  findOne(@Param('id') id: string): Promise<PollResponseDto> {
    return this.pollsService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: HttpStatus.OK, type: PollResponseDto })
  update(
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
  ): Promise<PollResponseDto> {
    return this.pollsService.update(id, updatePollDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: PollDeleteResponseDto })
  remove(@Param('id') id: string): Promise<PollDeleteResponseDto> {
    return this.pollsService.remove(id);
  }
}
