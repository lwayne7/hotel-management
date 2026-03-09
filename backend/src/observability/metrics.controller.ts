import { Controller, Get, Post, Body, Header, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

interface WebVitalMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsPayload {
  metrics: WebVitalMetric[];
}

@ApiTags('可观测性')
@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus 指标端点' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  @Post('web-vitals')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '接收前端 Web Vitals 性能指标上报' })
  receiveWebVitals(@Body() payload: WebVitalsPayload): void {
    if (!Array.isArray(payload?.metrics)) return;

    for (const metric of payload.metrics) {
      this.logger.log(
        `[WebVitals] ${metric.name}=${metric.value.toFixed(1)} rating=${metric.rating ?? 'n/a'}`,
      );
      // 将 Web Vitals 数据注入 Prometheus metrics（可选，如需要更精细的监控）
      this.metricsService.observeWebVital(metric.name, metric.value, metric.rating);
    }
  }
}
