import { ApiProperty } from '@nestjs/swagger';

export class VoteResponseDto {
  @ApiProperty({ type: 'string' })
  message: string;
}
