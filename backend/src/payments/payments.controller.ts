import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentSignatureGuard } from './guards/payment-signature.guard';

@ApiTags('支付')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('callback')
  @Throttle({ default: { limit: 30, ttl: 60_000 } }) // 支付回调：每 IP 每分钟最多 30 次
  @UseGuards(PaymentSignatureGuard)
  @ApiOperation({ summary: '支付回调（幂等 + 签名验证）' })
  @ApiHeader({
    name: 'x-payment-signature',
    description: 'HMAC-SHA256 签名',
    required: false,
  })
  @ApiHeader({
    name: 'x-payment-timestamp',
    description: '请求时间戳（毫秒）',
    required: false,
  })
  async callback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.handleCallback(dto);
  }
}
