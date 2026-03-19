import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';
import { Request } from 'express';

/**
 * 支付回调签名验证守卫。
 *
 * 真实支付网关（微信支付/支付宝）会在回调请求中附带签名，
 * 服务端需要验签以确保请求确实来自支付网关而非伪造。
 *
 * 本守卫模拟此机制：
 * - 读取请求头 x-payment-signature 和 x-payment-timestamp
 * - 用 PAYMENT_SECRET 对 timestamp + body JSON 做 HMAC-SHA256
 * - 比对签名是否匹配
 * - 检查 timestamp 是否在 5 分钟窗口内（防重放攻击）
 *
 * 开发环境（未设置 PAYMENT_SECRET）下给出警告但放行，生产环境必须配置。
 */
@Injectable()
export class PaymentSignatureGuard implements CanActivate {
  private readonly paymentSecret: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.paymentSecret = this.configService.get<string>('PAYMENT_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 开发环境未配置签名密钥时放行但打印警告
    if (!this.paymentSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new ForbiddenException('支付签名密钥未配置，拒绝回调请求');
      }
      console.warn(
        '[PaymentSignatureGuard] PAYMENT_SECRET 未设置，跳过签名校验（仅限开发环境）',
      );
      return true;
    }

    const signature = readHeader(request, 'x-payment-signature');
    const timestamp = readHeader(request, 'x-payment-timestamp');

    if (!signature || !timestamp) {
      throw new ForbiddenException(
        '缺少支付签名头 (x-payment-signature, x-payment-timestamp)',
      );
    }

    // 检查时间戳窗口（防重放攻击）：5 分钟内有效
    const ts = Number(timestamp);
    if (Number.isNaN(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) {
      throw new ForbiddenException('支付回调时间戳过期或无效');
    }

    // 计算期望签名：HMAC-SHA256(timestamp + "." + JSON.stringify(body))
    const payload = `${timestamp}.${JSON.stringify(request.body ?? {})}`;
    const expected = createHmac('sha256', this.paymentSecret)
      .update(payload)
      .digest('hex');

    // 固定时间比较，防止时间侧信道攻击
    if (!timingSafeEqual(signature, expected)) {
      throw new ForbiddenException('支付回调签名校验失败');
    }

    return true;
  }
}

function readHeader(request: Request, name: string): string | null {
  const value = request.headers[name];
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim())
    return value[0];
  return null;
}

/** 固定时间字符串比较，使用 Node.js 内置 crypto.timingSafeEqual 防止时间侧信道攻击 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return cryptoTimingSafeEqual(bufA, bufB);
}
