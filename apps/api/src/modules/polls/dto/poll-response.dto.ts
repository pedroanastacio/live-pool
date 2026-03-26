import { PollStatus } from '@live-pool/database';
import { ApiProperty } from '@nestjs/swagger';

export class PollOptionResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string' })
  description: string;

  @ApiProperty({ type: 'number', format: 'int32', minimum: 0 })
  ordeIndex: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}

export class PollResponseDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @ApiProperty({ type: 'string' })
  title: string;

  @ApiProperty({ type: 'string', nullable: true })
  description: string | null;

  @ApiProperty({ enum: PollStatus })
  status: PollStatus;

  @ApiProperty({ type: 'string', format: 'date-time' })
  expiresAt: Date;

  @ApiProperty({ type: [PollOptionResponseDto], minItems: 2 })
  options: PollOptionResponseDto[];

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt: Date;
}

export class PollDeleteResponseDto {
  @ApiProperty({ type: 'string' })
  message: string;
}
