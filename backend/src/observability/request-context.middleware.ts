import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

declare module 'http' {
  // 扩展 Node 原生 IncomingMessage 以挂载 requestId
  interface IncomingMessage {
    requestId?: string;
    requestStartTime?: number;
  }
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();

    req.requestId = requestId;
    req.requestStartTime = Date.now();

    res.setHeader('x-request-id', requestId);

    next();
  }
}
