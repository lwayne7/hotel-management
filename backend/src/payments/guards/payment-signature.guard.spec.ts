import { createHmac } from 'crypto';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSignatureGuard } from './payment-signature.guard';

function createMockContext(
  headers: Record<string, string>,
  body: unknown = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, body }),
    }),
  } as unknown as ExecutionContext;
}

function sign(secret: string, timestamp: string, body: unknown): string {
  const payload = `${timestamp}.${JSON.stringify(body ?? {})}`;
  return createHmac('sha256', secret).update(payload).digest('hex');
}

describe('PaymentSignatureGuard', () => {
  const SECRET = 'test-payment-secret';
  let guard: PaymentSignatureGuard;

  beforeEach(() => {
    const configService = { get: (key: string) => (key === 'PAYMENT_SECRET' ? SECRET : undefined) } as ConfigService;
    guard = new PaymentSignatureGuard(configService);
  });

  it('should allow request with valid signature and timestamp', () => {
    const ts = String(Date.now());
    const body = { orderId: 1, eventId: 'evt_1' };
    const sig = sign(SECRET, ts, body);
    const ctx = createMockContext(
      { 'x-payment-signature': sig, 'x-payment-timestamp': ts },
      body,
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should reject request with wrong signature', () => {
    const ts = String(Date.now());
    const body = { orderId: 1 };
    const ctx = createMockContext(
      { 'x-payment-signature': 'wrong-sig', 'x-payment-timestamp': ts },
      body,
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should reject request with expired timestamp (>5 min)', () => {
    const ts = String(Date.now() - 6 * 60_000);
    const body = { orderId: 1 };
    const sig = sign(SECRET, ts, body);
    const ctx = createMockContext(
      { 'x-payment-signature': sig, 'x-payment-timestamp': ts },
      body,
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should reject request with missing signature header', () => {
    const ctx = createMockContext({ 'x-payment-timestamp': String(Date.now()) });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should reject request with missing timestamp header', () => {
    const ctx = createMockContext({ 'x-payment-signature': 'some-sig' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should reject request with tampered body', () => {
    const ts = String(Date.now());
    const originalBody = { orderId: 1, amount: 100 };
    const sig = sign(SECRET, ts, originalBody);
    const tamperedBody = { orderId: 1, amount: 999 };
    const ctx = createMockContext(
      { 'x-payment-signature': sig, 'x-payment-timestamp': ts },
      tamperedBody,
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  describe('without PAYMENT_SECRET configured', () => {
    let guardNoSecret: PaymentSignatureGuard;

    beforeEach(() => {
      const configService = { get: () => undefined } as unknown as ConfigService;
      guardNoSecret = new PaymentSignatureGuard(configService);
    });

    it('should allow in non-production without secret (dev mode)', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const ctx = createMockContext({});
      expect(guardNoSecret.canActivate(ctx)).toBe(true);
      process.env.NODE_ENV = originalEnv;
    });
  });
});
