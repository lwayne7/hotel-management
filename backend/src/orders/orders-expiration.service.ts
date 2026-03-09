import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrdersExpirationService {
  private readonly logger = new Logger(OrdersExpirationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * 每分钟扫描过期的待支付订单，将其标记为 expired 并释放库存。
   * 避免仅依赖"懒过期"导致库存长期被无效订单占用。
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    const repo = this.dataSource.getRepository(Order);
    const now = Date.now();

    const expiredOrders = await repo.find({
      where: {
        status: OrderStatus.PENDING_PAYMENT,
        expiresAt: LessThan(now) as unknown as number,
      },
    });

    if (expiredOrders.length === 0) return;

    this.logger.log(`发现 ${expiredOrders.length} 笔过期订单，开始处理...`);

    let successCount = 0;
    for (const order of expiredOrders) {
      try {
        const isPostgres = this.dataSource.options.type === 'postgres';
        await this.dataSource.transaction(async (manager) => {
          const orderRepo = manager.getRepository(Order);
          const fresh = await orderRepo.findOne({ where: { id: order.id } });
          if (!fresh || fresh.status !== OrderStatus.PENDING_PAYMENT) return;
          if (Date.now() <= Number(fresh.expiresAt)) return;

          await this.inventoryService.release(
            manager,
            fresh.roomTypeId,
            fresh.checkInDate,
            fresh.checkOutDate,
            fresh.rooms,
            { lock: isPostgres },
          );

          fresh.status = OrderStatus.EXPIRED;
          fresh.expiredAt = Date.now();
          await orderRepo.save(fresh);
        });
        successCount++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`订单 ${order.orderNo} 过期处理失败: ${message}`);
      }
    }

    this.logger.log(`过期订单处理完成：${successCount}/${expiredOrders.length}`);
  }
}
