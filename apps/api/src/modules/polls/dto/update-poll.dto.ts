import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { PollStatus } from '@live-pool/database';

export class UpdatePollDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PollStatus)
  @IsOptional()
  status?: PollStatus;

  @IsDateString()
  @IsOptional()
  expires_at?: string;
}
