import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PollStatus } from '@live-pool/database';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePollDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  description?: string;

  @IsEnum(PollStatus)
  @IsOptional()
  @ApiProperty({ enum: PollStatus, required: false })
  status?: PollStatus;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  expiresAt?: string;
}
