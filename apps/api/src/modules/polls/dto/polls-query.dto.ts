import { PollStatus } from '@live-pool/database';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MinLength,
} from 'class-validator';

import { SortOrder } from '../../../general/types/sort.type';
import { SortPollByField } from '../types/sort.type';

export class PollsQueryDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @ApiProperty({ type: 'string', required: false })
  search?: string;

  @IsEnum(PollStatus)
  @IsOptional()
  @ApiProperty({ enum: PollStatus, required: false })
  status?: PollStatus;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'date', required: false })
  expiresBefore?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'date', required: false })
  expiresAfter?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'date', required: false })
  expiresAt?: string;

  @IsEnum(SortPollByField)
  @IsOptional()
  @ApiProperty({ enum: SortPollByField, required: false })
  sortBy?: SortPollByField;

  @IsEnum(SortOrder)
  @IsOptional()
  @ApiProperty({ enum: SortOrder, required: false })
  order?: SortOrder;
}
