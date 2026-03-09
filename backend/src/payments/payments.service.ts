import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentEvent, PaymentEventStatus } from './payment-event.entity';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PaymentEvent)
    private readonly paymentEventsRepo: Repository<PaymentEvent>,
    private readonly ordersService: OrdersService,
  ) {}

  async handleCallback(dto: PaymentCallbackDto) {
    // 幂等：eventId 唯一索引，重复回调直接读旧记录返回
    const existing = await this.paymentEventsRepo.findOne({
      where: { eventId: dto.eventId },
    });
    if (existing) {
      return {
        ok: true,
        idempotent: true,
        event: existing,
      };
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(PaymentEvent);
      const event = repo.create({
        eventId: dto.eventId,
        orderId: dto.orderId,
        paymentNo: dto.paymentNo ?? null,
        status: PaymentEventStatus.RECEIVED,
        rawPayload: dto as unknown as Record<string, unknown>,
        processedAt: null,
      });
      const saved = await repo.save(event);

      const order = await this.ordersService.confirmPaidByCallback({
        orderId: dto.orderId,
        eventId: dto.eventId,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      });

      saved.status =
        order.status === OrderStatus.PAID
          ? PaymentEventStatus.PROCESSED
          : PaymentEventStatus.IGNORED;
      saved.processedAt = Date.now();
      await repo.save(saved);

      return {
        ok: true,
        idempotent: false,
        event: saved,
        order,
      };
    });
  }
}
