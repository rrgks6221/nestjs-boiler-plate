import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @ApiOperation({ summary: 'health check' })
  @Get('health')
  @HealthCheck()
  async check() {
    return await this.healthCheckService.check([]);
  }
}
