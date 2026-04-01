import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateVoteDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'uuid' })
  pollId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'uuid' })
  pollOptionId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'uuid' })
  messageKey: string;
}
