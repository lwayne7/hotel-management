import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

@ApiTags('支付')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('callback')
  @ApiOperation({ summary: '模拟支付回调（幂等）' })
  async callback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.handleCallback(dto);
  }
}

