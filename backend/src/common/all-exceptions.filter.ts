import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * 全局统一异常过滤器。
 * - 业务异常（HttpException）：返回原始 statusCode 与 message
 * - 系统异常（Error / 未知错误）：返回 500 + 通用错误信息，不暴露内部细节
 * - 日志记录完整错误堆栈，附带 requestId
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();

    const requestId: string =
      request.requestId ??
      (request.headers['x-request-id'] as string | undefined) ??
      '-';

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      // 业务异常：保留 NestJS 原始响应结构
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        message = (obj.message as string | string[]) || exception.message;
        error = (obj.error as string) || HttpStatus[status] || 'Error';
      } else {
        message = typeof body === 'string' ? body : exception.message;
        error = HttpStatus[status] || 'Error';
      }
    } else {
      // 系统异常：不暴露内部细节
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误，请稍后重试';
      error = 'Internal Server Error';

      // 完整错误堆栈写入日志
      this.logger.error(
        `Unhandled exception [${requestId}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
