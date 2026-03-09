import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentEventStatus {
  RECEIVED = 'received',
  PROCESSED = 'processed',
  IGNORED = 'ignored',
}

const bigintToNumber = {
  to: (value: number | null) => value,
  from: (value: unknown) => (value == null ? null : Number(value)),
};

@Entity('payment_events')
@Index(['eventId'], { unique: true })
export class PaymentEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80 })
  eventId: string;

  @Index()
  @Column()
  orderId: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  paymentNo: string | null;

  @Column({ type: 'varchar', length: 20, default: PaymentEventStatus.RECEIVED })
  status: PaymentEventStatus;

  @Column({ type: 'simple-json', nullable: true })
  rawPayload: Record<string, unknown> | null;

  @Column({ type: 'bigint', nullable: true, transformer: bigintToNumber })
  processedAt: number | null;

  @CreateDateColumn()
  createdAt: Date;
}

