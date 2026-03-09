import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  private readonly httpRequestsTotal: Counter<string>;

  private readonly httpRequestDurationMs: Histogram<string>;

  private readonly webVitalsHistogram: Histogram<string>;

  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDurationMs = new Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in ms',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [50, 100, 300, 500, 1000, 2000, 5000, 10000],
      registers: [this.registry],
    });

    this.webVitalsHistogram = new Histogram({
      name: 'web_vitals',
      help: 'Frontend Web Vitals metrics (FCP, LCP, CLS, FID, TTFB)',
      labelNames: ['metric_name', 'rating'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    collectDefaultMetrics({
      register: this.registry,
      prefix: 'hotel_backend_',
    });
  }

  observeRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ) {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationMs.observe(labels, durationMs);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  observeWebVital(name: string, value: number, rating?: string) {
    this.webVitalsHistogram.observe(
      { metric_name: name, rating: rating ?? 'unknown' },
      value,
    );
  }
}
