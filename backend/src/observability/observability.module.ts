import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  providers: [MetricsService, LoggingInterceptor],
  controllers: [MetricsController, HealthController],
  exports: [MetricsService, LoggingInterceptor],
})
export class ObservabilityModule {}
