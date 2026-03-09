import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEvent } from './payment-event.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentSignatureGuard } from './guards/payment-signature.guard';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEvent]), OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentSignatureGuard],
})
export class PaymentsModule {}
