import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check / hello world' })
  @ApiResponse({
    status: 200,
    description: 'Application is running',
    schema: { type: 'string' },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
