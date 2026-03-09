import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

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
    const request = context.switchToHttp().getRequest();

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

    const signature = request.headers['x-payment-signature'] as string;
    const timestamp = request.headers['x-payment-timestamp'] as string;

    if (!signature || !timestamp) {
      throw new ForbiddenException('缺少支付签名头 (x-payment-signature, x-payment-timestamp)');
    }

    // 检查时间戳窗口（防重放攻击）：5 分钟内有效
    const ts = Number(timestamp);
    if (Number.isNaN(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) {
      throw new ForbiddenException('支付回调时间戳过期或无效');
    }

    // 计算期望签名：HMAC-SHA256(timestamp + "." + JSON.stringify(body))
    const payload = `${timestamp}.${JSON.stringify(request.body)}`;
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

/** 固定时间字符串比较 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
