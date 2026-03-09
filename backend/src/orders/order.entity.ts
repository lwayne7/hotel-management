import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

const bigintToNumber = {
  to: (value: number | null) => value,
  from: (value: unknown) => (value == null ? null : Number(value)),
};

@Entity('orders')
@Index(['orderNo'], { unique: true })
@Index(['status', 'expiresAt'])  // 过期订单扫描（定时任务使用）
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40 })
  orderNo: string;

  @Index()
  @Column()
  userId: number;

  @Index()
  @Column()
  hotelId: number;

  @Index()
  @Column()
  roomTypeId: number;

  @Column({ type: 'date' })
  checkInDate: string;

  @Column({ type: 'date' })
  checkOutDate: string;

  @Column({ type: 'int', default: 1 })
  rooms: number;

  @Column({ type: 'int', default: 1 })
  guests: number;

  /**
   * 下单时金额快照：单位分（integer）避免浮点误差。
   */
  @Column({ type: 'int' })
  amountCents: number;

  @Column({ type: 'varchar', length: 30, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  paidAt: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  cancelledAt: number | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  expiredAt: number | null;

  @Column({ type: 'bigint', transformer: bigintToNumber })
  expiresAt: number;

  /**
   * 支付成功的幂等键（来自 PaymentEvent.eventId）。
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  paymentEventId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

