import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from './dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, type: HealthCheckResponseDto })
  getHello(): HealthCheckResponseDto {
    return this.appService.getHello();
  }
}
