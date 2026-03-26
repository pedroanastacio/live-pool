import { Injectable } from '@nestjs/common';
import { HealthCheckResponseDto } from './dto';

@Injectable()
export class AppService {
  getHello(): HealthCheckResponseDto {
    return {
      status: 'OK',
      date: new Date(),
    };
  }
}
