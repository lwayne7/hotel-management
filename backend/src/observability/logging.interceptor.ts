import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

type RequestWithContext = Request & {
  requestId?: string;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<RequestWithContext>();
    const res = httpCtx.getResponse<Response>();

    const method = req.method;
    const originalUrl = req.originalUrl || req.url;
    const route = req.path || originalUrl;
    const requestId =
      typeof req.requestId === 'string' ? req.requestId : undefined;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const statusCode = res.statusCode;

        if (process.env.NODE_ENV !== 'test') {
          // 结构化日志，便于后续接入集中日志系统

          console.log(
            JSON.stringify({
              type: 'http_request',
              timestamp: new Date().toISOString(),
              requestId,
              method,
              route,
              originalUrl,
              statusCode,
              durationMs: duration,
              userId: (req as any).user?.id ?? null,
            }),
          );
        }

        this.metricsService.observeRequest(method, route, statusCode, duration);
      }),
    );
  }
}
