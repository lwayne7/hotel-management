import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Hotel, HotelStatus } from '../hotels/entities/hotel.entity';
import { RoomType } from '../hotels/entities/room-type.entity';
import { InventoryService } from '../inventory/inventory.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

function dateOnly(input: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return new Date(input).toISOString().slice(0, 10);
}

function diffDays(checkIn: string, checkOut: string): number {
  const a = new Date(`${dateOnly(checkIn)}T00:00:00.000Z`).getTime();
  const b = new Date(`${dateOnly(checkOut)}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function genOrderNo(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `O${y}${m}${d}${rand}`;
}

function toCents(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : (value as number);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    private readonly inventoryService: InventoryService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  private shouldLock(): boolean {
    return this.dataSource.options.type === 'postgres';
  }

  async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    const nights = diffDays(dto.checkInDate, dto.checkOutDate);
    if (nights <= 0) {
      throw new ForbiddenException('离店日期必须大于入住日期');
    }

    return this.dataSource.transaction(async (manager) => {
      const hotel = await manager.getRepository(Hotel).findOne({
        where: { id: dto.hotelId },
      });
      if (!hotel || hotel.status !== HotelStatus.APPROVED) {
        throw new NotFoundException('酒店不存在或未发布');
      }

      const roomType = await manager.getRepository(RoomType).findOne({
        where: { id: dto.roomTypeId, hotelId: dto.hotelId },
      });
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      const maxGuestsPerRoom = roomType.maxGuests ?? 2;
      if (dto.guests > maxGuestsPerRoom * dto.rooms) {
        throw new ForbiddenException('入住人数超过房型可容纳人数');
      }

      const amountCents = toCents(roomType.price) * dto.rooms * nights;
      const expiresAt = Date.now() + 15 * 60_000;

      await this.inventoryService.reserve(
        manager,
        dto.roomTypeId,
        dto.checkInDate,
        dto.checkOutDate,
        dto.rooms,
        { lock: this.shouldLock() },
      );

      const order = manager.getRepository(Order).create({
        orderNo: genOrderNo(),
        userId,
        hotelId: dto.hotelId,
        roomTypeId: dto.roomTypeId,
        checkInDate: dateOnly(dto.checkInDate),
        checkOutDate: dateOnly(dto.checkOutDate),
        rooms: dto.rooms,
        guests: dto.guests,
        amountCents,
        status: OrderStatus.PENDING_PAYMENT,
        expiresAt,
        paidAt: null,
        cancelledAt: null,
        expiredAt: null,
        paymentEventId: null,
      });

      const saved = await manager.getRepository(Order).save(order);

      // 下单通知商户（订单产生）
      this.notificationsGateway.sendNotification({
        type: 'order_created',
        hotelId: hotel.id,
        hotelName: hotel.nameCn,
        message: `新订单：${saved.orderNo}（房型#${dto.roomTypeId}，${saved.checkInDate}~${saved.checkOutDate}，${saved.rooms}间）`,
        timestamp: Date.now(),
        targetUserId: hotel.merchantId,
      });

      return saved;
    });
  }

  async getMyOrders(userId: number, page = 1, pageSize = 10) {
    const [data, total] = await this.ordersRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async cancelOrder(userId: number, orderId: number): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const order = await repo.findOne({ where: { id: orderId } });
      if (!order) throw new NotFoundException('订单不存在');
      if (order.userId !== userId) throw new ForbiddenException('无权操作此订单');

      // 超时自动过期（在关键路径补一次“懒过期”）
      if (order.status === OrderStatus.PENDING_PAYMENT && Date.now() > Number(order.expiresAt)) {
        order.status = OrderStatus.EXPIRED;
        order.expiredAt = Date.now();
        await this.inventoryService.release(
          manager,
          order.roomTypeId,
          order.checkInDate,
          order.checkOutDate,
          order.rooms,
          { lock: this.shouldLock() },
        );
        return repo.save(order);
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new ForbiddenException('仅待支付订单可取消');
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = Date.now();
      await this.inventoryService.release(
        manager,
        order.roomTypeId,
        order.checkInDate,
        order.checkOutDate,
        order.rooms,
        { lock: this.shouldLock() },
      );
      const saved = await repo.save(order);

      // 通知商户 + 通知用户（状态变化）
      const hotel = await manager.getRepository(Hotel).findOne({ where: { id: order.hotelId } });
      if (hotel) {
        this.notificationsGateway.sendNotification({
          type: 'order_cancelled',
          hotelId: hotel.id,
          hotelName: hotel.nameCn,
          message: `订单已取消：${saved.orderNo}`,
          timestamp: Date.now(),
          targetUserId: hotel.merchantId,
        });
      }
      this.notificationsGateway.sendNotification({
        type: 'order_cancelled',
        hotelId: order.hotelId,
        hotelName: hotel?.nameCn ?? '酒店',
        message: `您已取消订单：${saved.orderNo}`,
        timestamp: Date.now(),
        targetUserId: userId,
      });

      return saved;
    });
  }

  /**
   * 删除订单：仅允许删除“非待支付”的自己的订单（避免删除仍在进行中的预订）。
   * 该操作不会回滚库存，只作为数据清理与隐私需求使用。
   */
  async deleteOrder(userId: number, orderId: number): Promise<void> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.userId !== userId) throw new ForbiddenException('无权操作此订单');
    if (order.status === OrderStatus.PENDING_PAYMENT) {
      throw new ForbiddenException('待支付订单不可直接删除，请先取消');
    }
    await this.ordersRepo.remove(order);
  }

  /**
   * 由支付回调触发的确认支付：幂等/乱序安全。
   */
  async confirmPaidByCallback(params: {
    orderId: number;
    eventId: string;
    paidAt?: Date;
  }): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const order = await repo.findOne({ where: { id: params.orderId } });
      if (!order) throw new NotFoundException('订单不存在');

      // 已处理过（幂等）：直接返回
      if (order.status === OrderStatus.PAID) return order;
      if ([OrderStatus.CANCELLED, OrderStatus.EXPIRED].includes(order.status)) return order;

      // 过期：落终态并释放
      if (Date.now() > Number(order.expiresAt)) {
        order.status = OrderStatus.EXPIRED;
        order.expiredAt = Date.now();
        await this.inventoryService.release(
          manager,
          order.roomTypeId,
          order.checkInDate,
          order.checkOutDate,
          order.rooms,
          { lock: this.shouldLock() },
        );
        return repo.save(order);
      }

      await this.inventoryService.commit(
        manager,
        order.roomTypeId,
        order.checkInDate,
        order.checkOutDate,
        order.rooms,
        { lock: this.shouldLock() },
      );
      order.status = OrderStatus.PAID;
      order.paidAt = (params.paidAt ?? new Date()).getTime();
      order.paymentEventId = params.eventId;
      const saved = await repo.save(order);

      const hotel = await manager.getRepository(Hotel).findOne({ where: { id: order.hotelId } });
      if (hotel) {
        this.notificationsGateway.sendNotification({
          type: 'order_paid',
          hotelId: hotel.id,
          hotelName: hotel.nameCn,
          message: `订单已支付：${saved.orderNo}`,
          timestamp: Date.now(),
          targetUserId: hotel.merchantId,
        });
      }
      this.notificationsGateway.sendNotification({
        type: 'order_paid',
        hotelId: order.hotelId,
        hotelName: hotel?.nameCn ?? '酒店',
        message: `支付成功：${saved.orderNo}`,
        timestamp: Date.now(),
        targetUserId: saved.userId,
      });

      return saved;
    });
  }
}

