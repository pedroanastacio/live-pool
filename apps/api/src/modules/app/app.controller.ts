import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckResponseDto } from './dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: HealthCheckResponseDto })
  getHello(): HealthCheckResponseDto {
    return this.appService.getHello();
  }
}
