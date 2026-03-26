import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ enum: ['OK', 'ERROR'] })
  status: 'OK' | 'ERROR';

  @ApiProperty({ type: 'string', format: 'date-time' })
  date: Date;
}
