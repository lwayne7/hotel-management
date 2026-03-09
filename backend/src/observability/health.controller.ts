import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('healthz')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async getHealth() {
    const dbStart = Date.now();
    await this.dataSource.query('SELECT 1');
    const dbDuration = Date.now() - dbStart;

    return {
      status: 'ok',
      checks: {
        db: {
          status: 'up',
          responseTimeMs: dbDuration,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}
