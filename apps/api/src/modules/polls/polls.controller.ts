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

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  create(@Body() createPollDto: CreatePollDto): Promise<PollResponseDto> {
    return this.pollsService.create(createPollDto);
  }

  @Get()
  findAll(): Promise<PollResponseDto[]> {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PollResponseDto> {
    return this.pollsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePollDto: UpdatePollDto,
  ): Promise<PollResponseDto> {
    return this.pollsService.update(id, updatePollDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<PollDeleteResponseDto> {
    return this.pollsService.remove(id);
  }
}
